import Stripe from "stripe";
import { env } from "@/lib/env";
import {
  checkoutSessionShouldUnlock,
  customerIdFrom,
  invoiceOfferFromLines,
  paymentIntentIdFrom,
  revokeMembership,
  subscriptionIdFrom,
  subscriptionIsRevoked,
  unlockMembership,
} from "@/lib/stripe/unlock";
import { stubInsert } from "@/lib/supabase/stub";

export type WebhookHandleResult =
  | { ok: true; stub: true; note: string }
  | { ok: true; stub: false; type: string; unlocked?: boolean; skipped?: string }
  | { ok: false; status: number; message: string };

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<WebhookHandleResult> {
  if (!env.stripeWebhookSecret) {
    stubInsert("referrals_audit", { kind: "stripe_webhook_stub", received: true });
    return {
      ok: true,
      stub: true,
      note: "Webhook accepted in stub mode. Configure STRIPE_WEBHOOK_SECRET for verification. Membership was not changed. Nothing was charged.",
    };
  }
  if (!signature) {
    return { ok: false, status: 400, message: "Missing signature" };
  }

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch {
    return { ok: false, status: 400, message: "Invalid signature" };
  }

  const applied = await applyVerifiedStripeEvent(event);
  return {
    ok: true,
    stub: false,
    type: event.type,
    unlocked: applied.unlocked,
    skipped: applied.skipped,
  };
}

export async function applyVerifiedStripeEvent(event: Stripe.Event): Promise<{
  unlocked: boolean;
  skipped?: string;
}> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const gate = checkoutSessionShouldUnlock(session);
      if (!gate.ok) {
        stubInsert("referrals_audit", {
          kind: "stripe_event",
          type: event.type,
          skipped: gate.reason,
          session_id: session.id,
        });
        return { unlocked: false, skipped: gate.reason };
      }
      const result = await unlockMembership({
        eventId: event.id,
        source: "checkout",
        product: gate.product,
        accountId: session.metadata?.accountId || session.client_reference_id,
        email: session.customer_details?.email || session.customer_email,
        applicationId: session.metadata?.applicationId,
        stripeCustomerId: customerIdFrom(session.customer),
        stripeCheckoutSessionId: session.id,
        stripeInvoiceId: typeof session.invoice === "string" ? session.invoice : session.invoice?.id,
        stripePaymentIntentId: paymentIntentIdFrom(session.payment_intent),
        stripeSubscriptionId: subscriptionIdFrom(session.subscription),
      });
      return { unlocked: result.unlocked, skipped: result.skipped };
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const offer = invoiceOfferFromLines(invoice);
      if ("reason" in offer) {
        stubInsert("referrals_audit", { kind: "stripe_event", type: event.type, skipped: offer.reason });
        return { unlocked: false, skipped: offer.reason };
      }
      const result = await unlockMembership({
        eventId: event.id,
        source: "invoice",
        product: offer.product,
        accountId: invoice.metadata?.accountId,
        email: invoice.customer_email,
        applicationId: invoice.metadata?.applicationId,
        stripeCustomerId: customerIdFrom(invoice.customer),
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: paymentIntentIdFrom(
          (invoice as Stripe.Invoice & { payment_intent?: string | Stripe.PaymentIntent | null }).payment_intent,
        ),
        stripeSubscriptionId: subscriptionIdFrom(
          (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription,
        ),
        stripePriceId: offer.priceId,
      });
      return { unlocked: result.unlocked, skipped: result.skipped };
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscriptionIsRevoked(subscription.status)) {
        const result = await revokeMembership({
          eventId: event.id,
          accountId: subscription.metadata?.accountId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerIdFrom(subscription.customer),
        });
        return { unlocked: false, skipped: result.skipped ?? "revoked" };
      }
      if (subscription.status === "active") {
        const result = await unlockMembership({
          eventId: event.id,
          source: "subscription",
          product: "standard",
          accountId: subscription.metadata?.accountId,
          stripeCustomerId: customerIdFrom(subscription.customer),
          stripeSubscriptionId: subscription.id,
        });
        return { unlocked: result.unlocked, skipped: result.skipped };
      }
      return { unlocked: false, skipped: `subscription-${subscription.status}` };
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const result = await revokeMembership({
        eventId: event.id,
        accountId: subscription.metadata?.accountId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerIdFrom(subscription.customer),
      });
      return { unlocked: false, skipped: result.skipped ?? "revoked" };
    }
    default:
      stubInsert("referrals_audit", { kind: "stripe_event", type: event.type });
      return { unlocked: false, skipped: "ignored-event" };
  }
}
