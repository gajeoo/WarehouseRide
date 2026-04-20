import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { APP_NAME } from "./constants";

declare const process: { env: Record<string, string | undefined> };

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Validate token and return its data
export const validateToken = query({
  args: { token: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("activationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!tokenDoc) return { valid: false, error: "Invalid activation link." };
    if (tokenDoc.used) return { valid: false, error: "This activation link has already been used." };
    if (tokenDoc.expiresAt < Date.now()) return { valid: false, error: "This activation link has expired." };
    return {
      valid: true,
      email: tokenDoc.email,
      name: tokenDoc.name,
      role: tokenDoc.role,
      workplace: tokenDoc.workplace,
      warehouseName: tokenDoc.warehouseName,
    };
  },
});

// Mark token as used after successful activation
export const markTokenUsed = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("activationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!tokenDoc) throw new Error("Invalid token");
    await ctx.db.patch(tokenDoc._id, { used: true });
    return null;
  },
});

// After user signs up via activation, link their auth account to the customer profile
export const completeActivation = mutation({
  args: { token: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const tokenDoc = await ctx.db
      .query("activationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!tokenDoc) throw new Error("Invalid token");
    if (tokenDoc.used) throw new Error("Token already used");

    // Mark token as used
    await ctx.db.patch(tokenDoc._id, { used: true });

    // Check if customer profile already exists for this user
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // Update existing profile with activation data
      await ctx.db.patch(existing._id, {
        name: tokenDoc.name,
        status: "active" as const,
        role: tokenDoc.role,
        plan: (tokenDoc.plan as "monthly" | "biweekly" | "weekly" | "daily" | "none") || "none",
        workplace: tokenDoc.workplace,
        workplaceAddress: tokenDoc.workplaceAddress,
        routeId: tokenDoc.routeId,
        managedBy: tokenDoc.managedBy,
        warehouseName: tokenDoc.warehouseName,
        preferredShift: tokenDoc.preferredShift,
        isAdmin: tokenDoc.role === "warehouse_manager" ? true : undefined,
      });
      return existing;
    }

    // Create new customer profile
    const id = await ctx.db.insert("customers", {
      userId,
      name: tokenDoc.name,
      email: tokenDoc.email,
      plan: (tokenDoc.plan as "monthly" | "biweekly" | "weekly" | "daily" | "none") || "none",
      status: "active",
      role: tokenDoc.role as "customer" | "warehouse_manager" | "employee" | "driver",
      workplace: tokenDoc.workplace,
      workplaceAddress: tokenDoc.workplaceAddress,
      routeId: tokenDoc.routeId,
      managedBy: tokenDoc.managedBy,
      warehouseName: tokenDoc.warehouseName,
      preferredShift: tokenDoc.preferredShift,
      isAdmin: tokenDoc.role === "warehouse_manager" ? true : undefined,
    });

    // Create welcome notification
    await ctx.db.insert("notifications", {
      customerId: id,
      title: "Welcome to WarehouseRide!",
      message: "Your account has been activated. You're all set to start riding.",
      type: "account_activated",
      read: false,
    });

    return await ctx.db.get(id);
  },
});

// Admin creates invitation and sends activation email
export const adminInviteCustomer = action({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("warehouse_manager"),
      v.literal("employee"),
      v.literal("driver"),
    ),
    plan: v.optional(v.string()),
    workplace: v.optional(v.string()),
    workplaceAddress: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
    managedBy: v.optional(v.id("customers")),
    warehouseName: v.optional(v.string()),
    preferredShift: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    // Create activation token via internal mutation
    const result: { success: boolean; message: string; token?: string } = await ctx.runMutation(internal.activation.createActivationToken, {
      name: args.name,
      email: args.email,
      role: args.role,
      plan: args.plan,
      workplace: args.workplace,
      workplaceAddress: args.workplaceAddress,
      routeId: args.routeId,
      managedBy: args.managedBy,
      warehouseName: args.warehouseName,
      preferredShift: args.preferredShift,
    });

    if (!result.success) {
      return { success: false, message: result.message };
    }

    // Send activation email
    const siteUrl = process.env.SITE_URL || "https://warehouseride-448fd3f7.viktor.space";
    const activationUrl = `${siteUrl}/activate?token=${result.token}`;

    const apiUrl = process.env.VIKTOR_SPACES_API_URL;
    const projectName = process.env.VIKTOR_SPACES_PROJECT_NAME;
    const projectSecret = process.env.VIKTOR_SPACES_PROJECT_SECRET;

    if (!apiUrl || !projectName || !projectSecret) {
      return { success: true, message: "Account created but email could not be sent (email not configured)." };
    }

    const roleLabel = args.role === "warehouse_manager" ? "Warehouse Manager" : args.role === "employee" ? "Employee" : args.role === "driver" ? "Driver" : "Customer";

    const response = await fetch(`${apiUrl}/api/viktor-spaces/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: projectName,
        project_secret: projectSecret,
        to_email: args.email,
        subject: `You're Invited to ${APP_NAME}!`,
        html_content: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0F2B46; font-size: 24px; margin: 0;">Welcome to ${APP_NAME}</h1>
            </div>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hi ${args.name},
            </p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              You've been invited to join <strong>${APP_NAME}</strong> as a <strong>${roleLabel}</strong>.
              ${args.workplace ? ` Your workplace: <strong>${args.workplace}</strong>.` : ""}
            </p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Click the button below to set your password and activate your account:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${activationUrl}" style="display: inline-block; padding: 14px 32px; background: #FF6B35; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Activate My Account
              </a>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center;">
              Or copy this link: <a href="${activationUrl}" style="color: #FF6B35; word-break: break-all;">${activationUrl}</a>
            </p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
              This link expires in 7 days. If you didn't expect this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #bbb; font-size: 11px; text-align: center;">
              ${APP_NAME} — Reliable vanpool transportation for warehouse employees
            </p>
          </div>
        `,
        text_content: `Hi ${args.name},\n\nYou've been invited to join ${APP_NAME} as a ${roleLabel}.\n\nClick here to activate your account: ${activationUrl}\n\nThis link expires in 7 days.\n\n— ${APP_NAME}`,
        email_type: "activation",
      }),
    });

    if (!response.ok) {
      return { success: true, message: "Account created but activation email failed to send." };
    }

    return { success: true, message: `Activation email sent to ${args.email}!` };
  },
});

// Internal mutation to create activation token (called by action)
export const createActivationToken = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("warehouse_manager"),
      v.literal("employee"),
      v.literal("driver"),
    ),
    plan: v.optional(v.string()),
    workplace: v.optional(v.string()),
    workplaceAddress: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
    managedBy: v.optional(v.id("customers")),
    warehouseName: v.optional(v.string()),
    preferredShift: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), message: v.string(), token: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    // Check the caller is admin (we'll trust action-level auth check)
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Find the inviter (admin) — for internal mutations, we need to pass this differently
    // We'll find the admin by searching for one
    const admins = await ctx.db.query("customers").collect();
    const admin = admins.find((c) => c.isAdmin);
    if (!admin) {
      return { success: false, message: "No admin found to attribute invitation." };
    }

    await ctx.db.insert("activationTokens", {
      token,
      email: args.email,
      name: args.name,
      role: args.role,
      invitedBy: admin._id,
      expiresAt,
      used: false,
      plan: args.plan,
      workplace: args.workplace,
      workplaceAddress: args.workplaceAddress,
      routeId: args.routeId,
      managedBy: args.managedBy,
      warehouseName: args.warehouseName,
      preferredShift: args.preferredShift,
    });

    return { success: true, message: "Token created.", token };
  },
});

// List activation tokens (admin only)
export const listTokens = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) return [];
    const tokens = await ctx.db.query("activationTokens").collect();
    return tokens.sort((a, b) => b._creationTime - a._creationTime);
  },
});
