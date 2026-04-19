import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

declare const process: { env: Record<string, string | undefined> };

const http = httpRouter();
auth.addHttpRoutes(http);

// Stripe webhook endpoint
http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      console.error("Missing webhook secret or signature");
      return new Response("Webhook not configured", { status: 400 });
    }

    // Verify Stripe signature
    try {
      const parts = signature.split(",");
      const timestamp = parts.find((p) => p.startsWith("t="))?.substring(2);
      const receivedSig = parts.find((p) => p.startsWith("v1="))?.substring(3);

      if (!timestamp || !receivedSig) {
        return new Response("Invalid signature format", { status: 400 });
      }

      // Verify timestamp (reject if older than 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parseInt(timestamp)) > 300) {
        return new Response("Timestamp too old", { status: 400 });
      }

      // Compute expected signature
      const signedPayload = `${timestamp}.${body}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
      const expectedSig = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSig !== receivedSig) {
        console.error("Stripe signature verification failed");
        return new Response("Invalid signature", { status: 400 });
      }
    } catch (e) {
      console.error("Signature verification error:", e);
      return new Response("Signature verification failed", { status: 400 });
    }

    // Parse event and handle
    try {
      const event = JSON.parse(body);
      await ctx.runAction(internal.stripe.handleWebhook, {
        eventType: event.type,
        data: event.data.object,
      });
      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error("Webhook processing error:", e);
      return new Response("Webhook error", { status: 500 });
    }
  }),
});

export default http;
