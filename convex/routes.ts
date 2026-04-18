import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db.query("routes").collect();
  },
});

export const getById = query({
  args: { id: v.id("routes") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMyRoute = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!customer?.routeId) return null;
    return await ctx.db.get(customer.routeId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    origin: v.string(),
    destination: v.string(),
    serviceArea: v.string(),
    shift: v.string(),
    departureTime: v.string(),
    returnTime: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    status: v.union(v.literal("active"), v.literal("inactive")),
    stops: v.optional(v.array(v.object({
      name: v.string(),
      lat: v.number(),
      lng: v.number(),
      order: v.number(),
    }))),
  },
  returns: v.id("routes"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) throw new Error("Not admin");
    return await ctx.db.insert("routes", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("routes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    serviceArea: v.optional(v.string()),
    shift: v.optional(v.string()),
    departureTime: v.optional(v.string()),
    returnTime: v.optional(v.string()),
    vehicleId: v.optional(v.id("vehicles")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
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

export const remove = mutation({
  args: { id: v.id("routes") },
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
