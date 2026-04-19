import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

// WarehouseRide plan configuration
const PLANS = {
  daily: {
    name: "Daily",
    priceEnvKey: "STRIPE_PRICE_DAILY",
    amount: 2000, // $20.00
    interval: null, // one-time
  },
  weekly: {
    name: "Weekly",
    priceEnvKey: "STRIPE_PRICE_WEEKLY",
    amount: 5000, // $50.00
    interval: "week",
  },
  biweekly: {
    name: "Bi-Weekly",
    priceEnvKey: "STRIPE_PRICE_BIWEEKLY",
    amount: 16500, // $165.00
    interval: "biweekly",
  },
  monthly: {
    name: "Monthly",
    priceEnvKey: "STRIPE_PRICE_MONTHLY",
    amount: 31500, // $315.00
    interval: "month",
  },
} as const;

/**
 * Make a Stripe API request
 */
async function stripeRequest(
  endpoint: string,
  method: string,
  body?: Record<string, string>,
): Promise<Response> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured yet");

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (body) {
    options.body = new URLSearchParams(body).toString();
  }

  return fetch(`https://api.stripe.com/v1${endpoint}`, options);
}

/**
 * Get Stripe configuration status
 */
export const getConfig = action({
  args: {},
  returns: v.object({
    isConfigured: v.boolean(),
    hasDailyPrice: v.boolean(),
    hasWeeklyPrice: v.boolean(),
    hasBiweeklyPrice: v.boolean(),
    hasMonthlyPrice: v.boolean(),
  }),
  handler: async () => {
    return {
      isConfigured: !!process.env.STRIPE_SECRET_KEY,
      hasDailyPrice: !!process.env.STRIPE_PRICE_DAILY,
      hasWeeklyPrice: !!process.env.STRIPE_PRICE_WEEKLY,
      hasBiweeklyPrice: !!process.env.STRIPE_PRICE_BIWEEKLY,
      hasMonthlyPrice: !!process.env.STRIPE_PRICE_MONTHLY,
    };
  },
});

/**
 * Create a Stripe Checkout Session for a plan
 */
export const createCheckoutSession = action({
  args: {
    plan: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly"),
    ),
  },
  returns: v.object({
    url: v.union(v.string(), v.null()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { plan }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { url: null, error: "Please sign in first" };
    }

    // Get user details
    const user = await ctx.runQuery(internal.stripe.getUserForCheckout, { userId });
    if (!user) {
      return { url: null, error: "User not found" };
    }

    const planConfig = PLANS[plan];
    const priceId = process.env[planConfig.priceEnvKey];
    if (!priceId) {
      return { url: null, error: "Stripe pricing not configured. Please contact support." };
    }

    const siteUrl = process.env.SITE_URL || "https://warehouseride-448fd3f7.viktor.space";
    const isSubscription = plan !== "daily";

    try {
      // Check if user already has a Stripe customer
      const existing = await ctx.runQuery(internal.stripe.getExistingSubscription, { userId });

      const params: Record<string, string> = {
        mode: isSubscription ? "subscription" : "payment",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
        cancel_url: `${siteUrl}/pricing`,
        "metadata[userId]": userId,
        "metadata[plan]": plan,
        allow_promotion_codes: "true",
      };

      if (existing?.stripeCustomerId) {
        params.customer = existing.stripeCustomerId;
      } else if (user.email) {
        params.customer_email = user.email;
      }

      const response = await stripeRequest("/checkout/sessions", "POST", params);

      if (!response.ok) {
        const err = await response.text();
        console.error("Stripe checkout error:", err);
        return { url: null, error: "Failed to create checkout session" };
      }

      const session = (await response.json()) as { url: string; id: string };

      // Track the checkout session
      await ctx.runMutation(internal.stripe.trackCheckoutSession, {
        userId,
        stripeSessionId: session.id,
        plan,
      });

      return { url: session.url };
    } catch (e) {
      console.error("Stripe error:", e);
      return { url: null, error: "Payment system error. Please try again." };
    }
  },
});

/**
 * Create a Stripe Customer Portal session
 */
export const createPortalSession = action({
  args: {},
  returns: v.object({
    url: v.union(v.string(), v.null()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { url: null, error: "Not authenticated" };
    }

    const sub = await ctx.runQuery(internal.stripe.getExistingSubscription, { userId });
    if (!sub?.stripeCustomerId) {
      return { url: null, error: "No subscription found" };
    }

    const siteUrl = process.env.SITE_URL || "https://warehouseride-448fd3f7.viktor.space";

    try {
      const response = await stripeRequest("/billing_portal/sessions", "POST", {
        customer: sub.stripeCustomerId,
        return_url: `${siteUrl}/invoices`,
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Stripe portal error:", err);
        return { url: null, error: "Failed to open billing portal" };
      }

      const session = (await response.json()) as { url: string };
      return { url: session.url };
    } catch (e) {
      console.error("Stripe portal error:", e);
      return { url: null, error: "Payment system error. Please try again." };
    }
  },
});

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = internalAction({
  args: {
    eventType: v.string(),
    data: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, { eventType, data }) => {
    console.log(`Processing Stripe webhook: ${eventType}`);

    switch (eventType) {
      case "checkout.session.completed": {
        const session = data as {
          id: string;
          customer: string;
          subscription: string | null;
          payment_intent: string | null;
          metadata: { userId: string; plan: string };
        };

        if (session.metadata?.userId) {
          const plan = session.metadata.plan as "daily" | "weekly" | "biweekly" | "monthly";

          if (session.subscription) {
            // Subscription plan — fetch details
            const subResponse = await stripeRequest(
              `/subscriptions/${session.subscription}`,
              "GET",
            );

            if (subResponse.ok) {
              const sub = (await subResponse.json()) as {
                id: string;
                customer: string;
                status: string;
                current_period_start: number;
                current_period_end: number;
                cancel_at_period_end: boolean;
                items: { data: Array<{ price: { id: string } }> };
              };

              await ctx.runMutation(internal.stripe.upsertSubscription, {
                userId: session.metadata.userId as any,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0]?.price.id ?? "",
                plan,
                status: sub.status,
                currentPeriodStart: sub.current_period_start * 1000,
                currentPeriodEnd: sub.current_period_end * 1000,
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              });
            }
          } else {
            // One-time payment (daily plan)
            await ctx.runMutation(internal.stripe.recordOneTimePayment, {
              userId: session.metadata.userId as any,
              stripeCustomerId: session.customer,
              stripePaymentIntentId: session.payment_intent || "",
              plan,
              amount: PLANS.daily.amount,
            });
          }

          // Update customer plan
          await ctx.runMutation(internal.stripe.updateCustomerPlan, {
            userId: session.metadata.userId as any,
            plan,
          });

          // Update checkout session
          await ctx.runMutation(internal.stripe.updateCheckoutSession, {
            stripeSessionId: session.id,
            status: "completed",
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = data as {
          id: string;
          status: string;
          cancel_at_period_end: boolean;
          current_period_start: number;
          current_period_end: number;
        };

        await ctx.runMutation(internal.stripe.updateSubscriptionByStripeId, {
          stripeSubscriptionId: sub.id,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodStart: sub.current_period_start * 1000,
          currentPeriodEnd: sub.current_period_end * 1000,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = data as { id: string };
        await ctx.runMutation(internal.stripe.updateSubscriptionByStripeId, {
          stripeSubscriptionId: sub.id,
          status: "canceled",
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = data as { subscription: string };
        if (invoice.subscription) {
          await ctx.runMutation(internal.stripe.updateSubscriptionByStripeId, {
            stripeSubscriptionId: invoice.subscription,
            status: "past_due",
          });
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return null;
  },
});

// ============ Internal helpers ============

export const getUserForCheckout = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { name: user.name ?? undefined, email: user.email ?? undefined };
  },
});

export const getExistingSubscription = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({ stripeCustomerId: v.string() }),
    v.null(),
  ),
  handler: async (ctx, { userId }) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (!sub) return null;
    return { stripeCustomerId: sub.stripeCustomerId };
  },
});

export const trackCheckoutSession = internalMutation({
  args: {
    userId: v.id("users"),
    stripeSessionId: v.string(),
    plan: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("checkoutSessions", {
      userId: args.userId,
      stripeSessionId: args.stripeSessionId,
      plan: args.plan,
      status: "pending",
    });
    return null;
  },
});

export const updateCheckoutSession = internalMutation({
  args: {
    stripeSessionId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("expired")),
  },
  returns: v.null(),
  handler: async (ctx, { stripeSessionId, status }) => {
    const session = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_stripeSessionId", (q) => q.eq("stripeSessionId", stripeSessionId))
      .unique();
    if (session) {
      await ctx.db.patch(session._id, { status });
    }
    return null;
  },
});

export const upsertSubscription = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    plan: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check for existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        plan: args.plan,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        plan: args.plan,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
    }
    return null;
  },
});

export const recordOneTimePayment = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripePaymentIntentId: v.string(),
    plan: v.string(),
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      plan: args.plan,
      amount: args.amount,
      status: "succeeded",
      paidAt: Date.now(),
    });
    return null;
  },
});

export const updateSubscriptionByStripeId = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    if (sub) {
      const updates: Record<string, unknown> = { status: args.status };
      if (args.cancelAtPeriodEnd !== undefined) updates.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
      if (args.currentPeriodStart !== undefined) updates.currentPeriodStart = args.currentPeriodStart;
      if (args.currentPeriodEnd !== undefined) updates.currentPeriodEnd = args.currentPeriodEnd;
      await ctx.db.patch(sub._id, updates);
    }
    return null;
  },
});

export const updateCustomerPlan = internalMutation({
  args: {
    userId: v.id("users"),
    plan: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { userId, plan }) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (customer) {
      const planMap: Record<string, string> = {
        daily: "daily",
        weekly: "weekly",
        biweekly: "biweekly",
        monthly: "monthly",
      };
      await ctx.db.patch(customer._id, {
        plan: (planMap[plan] || "none") as any,
        status: "active",
      });
    }
    return null;
  },
});

// ============ Public queries ============

export const getMySubscription = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

export const getMyPayments = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
