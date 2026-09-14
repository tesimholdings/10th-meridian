import { getStripe } from "@/lib/stripe/client";
import { env } from "@/lib/env";
import { stubInsert } from "@/lib/supabase/stub";

export async function POST(request: Request) {
  const stripe = getStripe();
  const raw = await request.text();

  if (!stripe || !env.stripeWebhookSecret) {
    stubInsert("referrals_audit", { kind: "stripe_webhook_stub", received: true });
    return Response.json({
      ok: true,
      stub: true,
      note: "Webhook accepted in stub mode. Configure STRIPE_WEBHOOK_SECRET for verification.",
    });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, env.stripeWebhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // Persist only Stripe references on memberships. Never card data.
      stubInsert("referrals_audit", { kind: "stripe_event", type: event.type });
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
