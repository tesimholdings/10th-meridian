import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { stubInsert } from "@/lib/supabase/stub";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type WebhookHandleResult =
  | { ok: true; stub: true; note: string }
  | { ok: true; stub: false; type: string }
  | { ok: false; status: number; message: string };

/**
 * Verifies Stripe signatures when STRIPE_WEBHOOK_SECRET is set.
 * Without keys, accepts a labeled stub so preview never charges or crashes.
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<WebhookHandleResult> {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    stubInsert("referrals_audit", { kind: "stripe_webhook_stub", received: true });
    return {
      ok: true,
      stub: true,
      note: "Webhook accepted in stub mode. Configure STRIPE_WEBHOOK_SECRET for verification. Nothing was charged.",
    };
  }

  if (!signature) {
    return { ok: false, status: 400, message: "Missing signature" };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch {
    return { ok: false, status: 400, message: "Invalid signature" };
  }

  await persistStripeEvent(event);
  return { ok: true, stub: false, type: event.type };
}

async function persistStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const admin = getSupabaseAdmin();
      const row = {
        kind: "stripe_event",
        type: event.type,
        session_id: session.id,
        account_id: session.metadata?.accountId ?? null,
        product: session.metadata?.product ?? "lifetime",
      };
      if (admin) {
        try {
          await admin.from("membership_events").insert(row);
        } catch {
          // Preview / missing table: fall through to the in-process stub.
        }
      }
      stubInsert("referrals_audit", row);
      break;
    }
    case "invoice.paid":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // Lifetime is one-time. These events are recorded only if a later product exists.
      stubInsert("referrals_audit", { kind: "stripe_event", type: event.type });
      break;
    default:
      break;
  }
}
