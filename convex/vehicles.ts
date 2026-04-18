import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db.query("vehicles").collect();
  },
});

export const getById = query({
  args: { id: v.id("vehicles") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    capacity: v.number(),
    licensePlate: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("inactive"),
    ),
  },
  returns: v.id("vehicles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) throw new Error("Not admin");
    return await ctx.db.insert("vehicles", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("vehicles"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    capacity: v.optional(v.number()),
    licensePlate: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("inactive"),
    )),
    currentLat: v.optional(v.number()),
    currentLng: v.optional(v.number()),
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
    if (updates.currentLat !== undefined) {
      (updates as Record<string, unknown>).lastLocationUpdate = Date.now();
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("vehicles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) throw new Error("Not admin");
    await ctx.db.delete(args.id);
    return null;
  },
});
