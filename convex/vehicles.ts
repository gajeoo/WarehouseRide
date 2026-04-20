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

// Admin: Toggle location sharing for a vehicle
export const toggleLocationSharing = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    shareLocationWithRiders: v.boolean(),
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
    await ctx.db.patch(args.vehicleId, {
      shareLocationWithRiders: args.shareLocationWithRiders,
    });
    return null;
  },
});

// Get vehicle with location sharing check (for riders)
export const getMyVehicleLocation = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    // Find the vehicle assigned to this rider's route
    let vehicle = null;
    if (profile.vehicleId) {
      vehicle = await ctx.db.get(profile.vehicleId);
    } else if (profile.routeId) {
      const route = await ctx.db.get(profile.routeId);
      if (route?.vehicleId) {
        vehicle = await ctx.db.get(route.vehicleId);
      }
    }

    if (!vehicle) return { vehicle: null, locationShared: false };

    // Check if admin has enabled location sharing
    const locationShared = vehicle.shareLocationWithRiders === true;
    return {
      vehicle: locationShared ? vehicle : {
        ...vehicle,
        currentLat: undefined,
        currentLng: undefined,
        lastLocationUpdate: undefined,
      },
      locationShared,
    };
  },
});

// Driver: Update own vehicle location
export const updateDriverLocation = mutation({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.role !== "driver") throw new Error("Not a driver");

    // Find vehicle assigned to this driver
    const vehicles = await ctx.db.query("vehicles").collect();
    const myVehicle = vehicles.find((v) => v.assignedDriverId === profile._id);
    if (!myVehicle) throw new Error("No vehicle assigned");

    await ctx.db.patch(myVehicle._id, {
      currentLat: args.lat,
      currentLng: args.lng,
      lastLocationUpdate: Date.now(),
    });
    return null;
  },
});
