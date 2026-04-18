import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    pickupArea: v.string(),
    workplaceAddress: v.string(),
    numberOfEmployees: v.number(),
    preferredPlan: v.string(),
    shift: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.id("quotes"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("quotes", {
      ...args,
      status: "new",
    });
  },
});

export const list = query({
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
    return await ctx.db.query("quotes").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("quotes"),
    status: v.union(
      v.literal("new"),
      v.literal("reviewed"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("rejected"),
    ),
    adminNotes: v.optional(v.string()),
    quotedPrice: v.optional(v.number()),
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
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const stats = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const all = await ctx.db.query("quotes").collect();
    return {
      total: all.length,
      new: all.filter((q) => q.status === "new").length,
      reviewed: all.filter((q) => q.status === "reviewed").length,
      contacted: all.filter((q) => q.status === "contacted").length,
      converted: all.filter((q) => q.status === "converted").length,
    };
  },
});
