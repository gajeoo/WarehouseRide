import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMyProfile = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return customer;
  },
});

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    // Check admin
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) return [];
    return await ctx.db.query("customers").collect();
  },
});

export const getById = query({
  args: { id: v.id("customers") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List employees managed by the current warehouse manager
export const listMyEmployees = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin && caller?.role !== "warehouse_manager") return [];

    // If admin, return all employees
    if (caller?.isAdmin) {
      const all = await ctx.db.query("customers").collect();
      return all.filter((c) => c.role === "employee");
    }

    // If warehouse manager, return employees managed by them
    const employees = await ctx.db
      .query("customers")
      .withIndex("by_managedBy", (q) => q.eq("managedBy", caller._id))
      .collect();
    return employees;
  },
});

export const updateProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    workplace: v.optional(v.string()),
    workplaceAddress: v.optional(v.string()),
    preferredShift: v.optional(v.string()),
    customShiftTime: v.optional(v.string()),
    workSchedule: v.optional(v.array(v.string())),
    scheduleNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!customer) throw new Error("Customer not found");
    await ctx.db.patch(customer._id, args);
    return null;
  },
});

export const adminUpdate = mutation({
  args: {
    customerId: v.id("customers"),
    plan: v.optional(v.union(
      v.literal("monthly"),
      v.literal("biweekly"),
      v.literal("weekly"),
      v.literal("daily"),
      v.literal("none"),
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended"),
    )),
    routeId: v.optional(v.id("routes")),
    vehicleId: v.optional(v.id("vehicles")),
    isAdmin: v.optional(v.boolean()),
    role: v.optional(v.union(
      v.literal("customer"),
      v.literal("warehouse_manager"),
      v.literal("employee"),
    )),
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
    const { customerId, ...updates } = args;
    await ctx.db.patch(customerId, updates);
    return null;
  },
});

export const ensureCustomerProfile = mutation({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const id = await ctx.db.insert("customers", {
      userId,
      name: user.name || "User",
      email: user.email || "",
      plan: "none",
      status: "pending",
      role: "customer",
      // Auto-make admin if email matches
      isAdmin: user.email === "gajeo21@gmail.com",
    });
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) return null;
    const all = await ctx.db.query("customers").collect();
    const active = all.filter((c) => c.status === "active").length;
    const pending = all.filter((c) => c.status === "pending").length;
    const monthly = all.filter((c) => c.plan === "monthly").length;
    const biweekly = all.filter((c) => c.plan === "biweekly").length;
    const weekly = all.filter((c) => c.plan === "weekly").length;
    const daily = all.filter((c) => c.plan === "daily").length;
    const employees = all.filter((c) => c.role === "employee").length;
    const managers = all.filter((c) => c.role === "warehouse_manager").length;
    return { total: all.length, active, pending, monthly, biweekly, weekly, daily, employees, managers };
  },
});

// Delete customer (admin only)
export const remove = mutation({
  args: { customerId: v.id("customers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller?.isAdmin) throw new Error("Not admin");
    await ctx.db.delete(args.customerId);
    return null;
  },
});
