import { env, canChargeLifetime, hasStripe } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { LIFETIME_PRICE_AMOUNT, LIFETIME_PRICE_LABEL } from "@/lib/copy/community";

export const LIFETIME_CHECKOUT_MODE = "payment" as const;

export type LifetimeCheckoutInput = {
  accountId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
};

export type LifetimeCheckoutResult =
  | { ok: true; stub: false; url: string; sessionId: string }
  | { ok: false; stub: true; reason: "missing-keys" | "missing-price" | "no-session" };

/**
 * $10,000 lifetime, one-time Checkout Session.
 * Never charges — and never invents an amount — without Stripe keys + a Price ID.
 */
export async function createLifetimeCheckoutSession(
  input: LifetimeCheckoutInput,
): Promise<LifetimeCheckoutResult> {
  if (!hasStripe()) {
    return { ok: false, stub: true, reason: "missing-keys" };
  }
  const priceId = env.stripeLifetimePriceId;
  if (!priceId) {
    return { ok: false, stub: true, reason: "missing-price" };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, stub: true, reason: "missing-keys" };
  }

  const session = await stripe.checkout.sessions.create({
    mode: LIFETIME_CHECKOUT_MODE,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.email,
    metadata: {
      accountId: input.accountId,
      product: "lifetime",
      amountLabel: LIFETIME_PRICE_LABEL,
      amountUsd: String(LIFETIME_PRICE_AMOUNT),
    },
  });

  if (!session.url) {
    return { ok: false, stub: true, reason: "no-session" };
  }
  return { ok: true, stub: false, url: session.url, sessionId: session.id };
}

export function lifetimeChargeReady(): boolean {
  return canChargeLifetime();
}

export function checkoutStubMessage(reason: LifetimeCheckoutResult extends { reason: infer R } ? R : string) {
  if (reason === "missing-price") {
    return "Stripe Checkout is stubbed. Create a one-time $10,000 Price and set STRIPE_PRICE_ID (or STRIPE_LIFETIME_PRICE_ID). No amount is invented.";
  }
  return "Stripe Checkout is stubbed. Add STRIPE_SECRET_KEY and an approved price ID. No amount is invented. Nothing is charged.";
}
