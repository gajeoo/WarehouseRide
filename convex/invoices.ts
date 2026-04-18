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
    return await ctx.db
      .query("invoices")
      .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
      .collect();
  },
});

export const listAll = query({
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
    return await ctx.db.query("invoices").collect();
  },
});

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    amount: v.number(),
    plan: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("overdue"),
    ),
  },
  returns: v.id("invoices"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) throw new Error("Not admin");
    return await ctx.db.insert("invoices", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("overdue"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) throw new Error("Not admin");
    await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "paid" ? { paidAt: Date.now() } : {}),
    });
    return null;
  },
});
