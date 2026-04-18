import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMine = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!customer) return [];
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
      .collect();
    return notifications.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const unreadCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!customer) return 0;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
      .collect();
    return notifications.filter((n) => !n.read).length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");
    await ctx.db.patch(args.id, { read: true });
    return null;
  },
});

export const markAllAsRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!customer) throw new Error("Customer not found");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
      .collect();
    for (const n of unread.filter((n) => !n.read)) {
      await ctx.db.patch(n._id, { read: true });
    }
    return null;
  },
});
