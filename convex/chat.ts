import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    customerId: v.id("customers"),
    message: v.string(),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const caller = await ctx.db
      .query("customers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!caller) throw new Error("No profile");
    const isAdmin = caller.isAdmin === true;
    return await ctx.db.insert("chatMessages", {
      customerId: args.customerId,
      senderType: isAdmin ? "admin" : "customer",
      senderName: caller.name,
      message: args.message,
      conversationId: args.customerId, // use customerId as conversationId
    });
  },
});

export const getConversation = query({
  args: { customerId: v.id("customers") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_customerId", (q) =>
        q.eq("customerId", args.customerId),
      )
      .collect();
    return messages.map((m) => ({
      ...m,
      senderRole: m.senderType, // alias for frontend
    }));
  },
});

export const listConversations = query({
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
    const messages = await ctx.db.query("chatMessages").collect();
    // Group by customerId
    const convMap = new Map<
      string,
      {
        customerId: string;
        customerName: string;
        lastMessage: string;
        lastTime: number;
        unreadCount: number;
      }
    >();
    for (const msg of messages) {
      if (!msg.customerId) continue;
      const key = msg.customerId;
      const existing = convMap.get(key);
      if (!existing) {
        // Look up customer name
        const customer = await ctx.db.get(msg.customerId);
        convMap.set(key, {
          customerId: key,
          customerName: customer?.name || msg.senderName,
          lastMessage: msg.message,
          lastTime: msg._creationTime,
          unreadCount: msg.senderType === "customer" ? 1 : 0,
        });
      } else {
        if (msg._creationTime > existing.lastTime) {
          existing.lastMessage = msg.message;
          existing.lastTime = msg._creationTime;
        }
        if (msg.senderType === "customer") {
          existing.unreadCount++;
        }
      }
    }
    return Array.from(convMap.values()).sort((a, b) => b.lastTime - a.lastTime);
  },
});
