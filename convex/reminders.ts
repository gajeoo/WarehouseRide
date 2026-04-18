import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { APP_NAME } from "./constants";
import type { Id } from "./_generated/dataModel";

declare const process: { env: Record<string, string | undefined> };

/**
 * Parse a departure time like "5:30 AM" into { hours, minutes } in 24h format.
 */
function parseDepartureTime(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

/**
 * Get customers who need a shift reminder right now.
 * We check for customers with:
 * - Active status
 * - An assigned route
 * - Route with a departure time within the next 25-35 minute window
 * - Haven't been reminded today
 */
export const getCustomersNeedingReminder = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];

    // Get all active customers with routes
    const customers = await ctx.db.query("customers").collect();
    const activeCustomers = customers.filter(
      (c) => c.status === "active" && c.routeId
    );

    const results: Array<{
      customerId: string;
      customerName: string;
      customerEmail: string;
      routeId: string;
      routeName: string;
      departureTime: string;
      origin: string;
      destination: string;
    }> = [];

    for (const customer of activeCustomers) {
      // Check if customer works today
      if (customer.workSchedule && customer.workSchedule.length > 0) {
        if (!customer.workSchedule.includes(currentDay)) continue;
      }

      // Get route
      if (!customer.routeId) continue;
      const route = await ctx.db.get(customer.routeId);
      if (!route || route.status !== "active") continue;

      // Parse departure time
      const departure = parseDepartureTime(route.departureTime);
      if (!departure) continue;

      // Check if departure is in 25-35 minutes from now
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const departureMinutes = departure.hours * 60 + departure.minutes;
      const diff = departureMinutes - nowMinutes;

      if (diff >= 25 && diff <= 35) {
        // Check if already reminded today
        const reminders = await ctx.db
          .query("shiftReminders")
          .withIndex("by_scheduledFor", (q) => q.eq("scheduledFor", todayStr))
          .collect();
        const alreadyReminded = reminders.some(
          (r) => r.customerId === customer._id && r.routeId === route._id
        );
        if (!alreadyReminded) {
          results.push({
            customerId: customer._id,
            customerName: customer.name,
            customerEmail: customer.email,
            routeId: route._id,
            routeName: route.name,
            departureTime: route.departureTime,
            origin: route.origin,
            destination: route.destination,
          });
        }
      }
    }

    return results;
  },
});

// Record that a reminder was sent
export const recordReminder = internalMutation({
  args: {
    customerId: v.id("customers"),
    routeId: v.id("routes"),
    scheduledFor: v.string(),
    type: v.union(v.literal("email"), v.literal("in_app")),
    status: v.union(v.literal("sent"), v.literal("failed")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("shiftReminders", {
      ...args,
      sentAt: Date.now(),
    });
    return null;
  },
});

// Create in-app notification for reminder
export const createReminderNotification = internalMutation({
  args: {
    customerId: v.id("customers"),
    departureTime: v.string(),
    routeName: v.string(),
    origin: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      customerId: args.customerId,
      title: "🚐 Pickup Reminder",
      message: `Your van departs at ${args.departureTime} from ${args.origin}. Route: ${args.routeName}. Be ready!`,
      type: "shift_reminder",
      read: false,
    });
    return null;
  },
});

/**
 * Main scheduled action: Check for customers needing reminders and send them.
 * Runs every 5 minutes via cron.
 */
export const sendShiftReminders = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const customers = await ctx.runQuery(internal.reminders.getCustomersNeedingReminder, {});

    if (!customers || customers.length === 0) return null;

    const todayStr = new Date().toISOString().split("T")[0];

    for (const c of customers) {
      // 1. Send email reminder
      try {
        const apiUrl = process.env.VIKTOR_SPACES_API_URL;
        const projectName = process.env.VIKTOR_SPACES_PROJECT_NAME;
        const projectSecret = process.env.VIKTOR_SPACES_PROJECT_SECRET;

        if (apiUrl && projectName && projectSecret) {
          await fetch(`${apiUrl}/api/viktor-spaces/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_name: projectName,
              project_secret: projectSecret,
              to_email: c.customerEmail,
              subject: `🚐 Pickup Reminder — ${c.departureTime} Today`,
              html_content: `
                <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px;">🚐</div>
                    <h2 style="color: #0F2B46; margin: 8px 0;">Pickup in 30 Minutes!</h2>
                  </div>
                  <div style="background: #FFF5F0; border-left: 4px solid #FF6B35; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
                    <p style="margin: 0; color: #333; font-size: 15px;">
                      <strong>Hi ${c.customerName},</strong><br/>
                      Your van departs at <strong>${c.departureTime}</strong> today.
                    </p>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                      <td style="padding: 8px 0; color: #888; font-size: 14px;">Route</td>
                      <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${c.routeName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #888; font-size: 14px;">Pickup From</td>
                      <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${c.origin}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #888; font-size: 14px;">Destination</td>
                      <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${c.destination}</td>
                    </tr>
                  </table>
                  <p style="color: #666; font-size: 13px; text-align: center;">
                    Please be at your pickup point 5 minutes before departure.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="color: #bbb; font-size: 11px; text-align: center;">${APP_NAME}</p>
                </div>
              `,
              text_content: `Pickup Reminder\n\nHi ${c.customerName}, your van departs at ${c.departureTime} today.\n\nRoute: ${c.routeName}\nPickup: ${c.origin}\nDestination: ${c.destination}\n\nPlease be at your pickup point 5 minutes before departure.\n\n— ${APP_NAME}`,
              email_type: "reminder",
            }),
          });

          await ctx.runMutation(internal.reminders.recordReminder, {
            customerId: c.customerId as Id<"customers">,
            routeId: c.routeId as Id<"routes">,
            scheduledFor: todayStr,
            type: "email",
            status: "sent",
          });
        }
      } catch (error) {
        console.error(`Failed to send email reminder to ${c.customerEmail}:`, error);
        await ctx.runMutation(internal.reminders.recordReminder, {
          customerId: c.customerId as Id<"customers">,
          routeId: c.routeId as Id<"routes">,
          scheduledFor: todayStr,
          type: "email",
          status: "failed",
        });
      }

      // 2. Create in-app notification
      try {
        await ctx.runMutation(internal.reminders.createReminderNotification, {
          customerId: c.customerId as Id<"customers">,
          departureTime: c.departureTime,
          routeName: c.routeName,
          origin: c.origin,
        });
      } catch (error) {
        console.error(`Failed to create in-app notification for ${c.customerEmail}:`, error);
      }
    }

    return null;
  },
});
