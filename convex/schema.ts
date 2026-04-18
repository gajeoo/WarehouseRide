import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Customer profiles (linked to auth users)
  customers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    workplace: v.optional(v.string()),
    workplaceAddress: v.optional(v.string()),
    plan: v.union(
      v.literal("monthly"),
      v.literal("biweekly"),
      v.literal("weekly"),
      v.literal("daily"),
      v.literal("none"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending"),
      v.literal("suspended"),
    ),
    preferredShift: v.optional(v.string()),
    customShiftTime: v.optional(v.string()),
    workSchedule: v.optional(v.array(v.string())), // ["Mon","Tue",...]
    scheduleNotes: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
    vehicleId: v.optional(v.id("vehicles")),
    isAdmin: v.optional(v.boolean()),
    // NEW: Role for warehouse managers / employees
    role: v.optional(v.union(
      v.literal("customer"),
      v.literal("warehouse_manager"),
      v.literal("employee"),
    )),
    // NEW: Who manages this employee (warehouse manager's customer ID)
    managedBy: v.optional(v.id("customers")),
    // NEW: Warehouse name for managers
    warehouseName: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_routeId", ["routeId"])
    .index("by_plan", ["plan"])
    .index("by_managedBy", ["managedBy"]),

  // Fleet vehicles
  vehicles: defineTable({
    name: v.string(),
    type: v.string(), // "van", "minibus"
    capacity: v.number(),
    licensePlate: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("inactive"),
    ),
    currentLat: v.optional(v.number()),
    currentLng: v.optional(v.number()),
    lastLocationUpdate: v.optional(v.number()),
  })
    .index("by_status", ["status"]),

  // Routes
  routes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    origin: v.string(),
    destination: v.string(),
    serviceArea: v.string(), // Baltimore, Columbia, etc.
    shift: v.string(), // "morning", "afternoon", "night"
    departureTime: v.string(),
    returnTime: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
    ),
    stops: v.optional(v.array(v.object({
      name: v.string(),
      lat: v.number(),
      lng: v.number(),
      order: v.number(),
    }))),
  })
    .index("by_status", ["status"])
    .index("by_serviceArea", ["serviceArea"])
    .index("by_vehicleId", ["vehicleId"]),

  // Quote requests
  quotes: defineTable({
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
    status: v.union(
      v.literal("new"),
      v.literal("reviewed"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("rejected"),
    ),
    adminNotes: v.optional(v.string()),
    quotedPrice: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),

  // Invoices
  invoices: defineTable({
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
    paidAt: v.optional(v.number()),
  })
    .index("by_customerId", ["customerId"])
    .index("by_status", ["status"]),

  // Contact messages
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
  })
    .index("by_status", ["status"]),

  // Support chat messages
  chatMessages: defineTable({
    customerId: v.optional(v.id("customers")),
    senderType: v.union(v.literal("customer"), v.literal("admin"), v.literal("ai")),
    senderName: v.string(),
    message: v.string(),
    conversationId: v.string(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_customerId", ["customerId"]),

  // Site settings (pricing, content, etc.)
  siteSettings: defineTable({
    key: v.string(),
    value: v.string(),
  })
    .index("by_key", ["key"]),

  // NEW: Activation tokens for invited users
  activationTokens: defineTable({
    token: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("warehouse_manager"),
      v.literal("employee"),
    ),
    invitedBy: v.id("customers"),
    expiresAt: v.number(),
    used: v.boolean(),
    // Optional: pre-assign route, plan, workplace, managedBy
    plan: v.optional(v.string()),
    workplace: v.optional(v.string()),
    workplaceAddress: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
    managedBy: v.optional(v.id("customers")),
    warehouseName: v.optional(v.string()),
    preferredShift: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_invitedBy", ["invitedBy"]),

  // NEW: Shift reminders tracking
  shiftReminders: defineTable({
    customerId: v.id("customers"),
    routeId: v.id("routes"),
    scheduledFor: v.string(), // ISO date of the shift
    sentAt: v.number(), // when the reminder was sent
    type: v.union(v.literal("email"), v.literal("in_app")),
    status: v.union(v.literal("sent"), v.literal("failed")),
  })
    .index("by_customerId", ["customerId"])
    .index("by_scheduledFor", ["scheduledFor"]),

  // NEW: In-app notifications
  notifications: defineTable({
    customerId: v.id("customers"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("shift_reminder"),
      v.literal("account_activated"),
      v.literal("route_assigned"),
      v.literal("general"),
    ),
    read: v.boolean(),
  })
    .index("by_customerId", ["customerId"]),
});

export default schema;
