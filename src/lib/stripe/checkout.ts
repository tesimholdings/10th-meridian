import { env, canChargeMembership, hasStripe } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import {
  checkoutMetadata,
  isApprovedFoundingPrice,
  isApprovedMonthlyPrice,
  isApprovedStandardEntryPrice,
  isArchivedLifetimePrice,
  type MembershipOffer,
} from "@/lib/stripe/catalog";
import { resolveMembershipOffer } from "@/lib/stripe/seats";

export type MembershipCheckoutInput = {
  accountId: string;
  email?: string;
  applicationId?: string;
  successUrl: string;
  cancelUrl: string;
  /** Test override. Production path always uses resolveMembershipOffer. */
  offer?: MembershipOffer;
};

export type MembershipCheckoutReason =
  | "missing-keys"
  | "missing-price"
  | "livemode-blocked"
  | "price-unverified"
  | "price-mismatch"
  | "price-inactive"
  | "archived-lifetime"
  | "already-active"
  | "no-session";

export type MembershipCheckoutResult =
  | { ok: true; stub: false; url: string; sessionId: string; offer: MembershipOffer; mode: "payment" | "subscription" }
  | { ok: false; stub: true; reason: MembershipCheckoutReason };

/**
 * Hosted Checkout:
 * - Founding Ten: mode=payment, $5,000 entry only.
 * - After Founding Ten / rejoin: mode=subscription with $10,000 one-time + $195/month.
 * Never applies coupons. Never uses the archived lifetime Price.
 */
export async function createMembershipCheckoutSession(
  input: MembershipCheckoutInput,
): Promise<MembershipCheckoutResult> {
  if (!hasStripe()) return { ok: false, stub: true, reason: "missing-keys" };
  if (!canChargeMembership()) {
    return {
      ok: false,
      stub: true,
      reason: env.stripeFoundingEntryPriceId || env.stripeStandardEntryPriceId ? "livemode-blocked" : "missing-price",
    };
  }

  const resolved = input.offer
    ? { offer: input.offer, reason: "founding-open" as const }
    : await resolveMembershipOffer({ accountId: input.accountId, email: input.email });
  if (resolved.reason === "already-active") {
    return { ok: false, stub: true, reason: "already-active" };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, stub: true, reason: "missing-keys" };

  const offer = resolved.offer;
  const metadata = checkoutMetadata({
    accountId: input.accountId,
    offer,
    applicationId: input.applicationId,
  });

  try {
    if (offer === "founding") {
      const priceId = env.stripeFoundingEntryPriceId;
      if (!priceId || isArchivedLifetimePrice(priceId)) {
        return { ok: false, stub: true, reason: isArchivedLifetimePrice(priceId) ? "archived-lifetime" : "missing-price" };
      }
      const price = await stripe.prices.retrieve(priceId);
      const check = isApprovedFoundingPrice(price);
      if (!check.ok) return { ok: false, stub: true, reason: check.reason };
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.accountId.slice(0, 200),
        customer_email: input.email || undefined,
        customer_creation: "always",
        invoice_creation: { enabled: true },
        allow_promotion_codes: false,
        submit_type: "pay",
        metadata,
        payment_intent_data: { metadata },
      });
      if (!session.url) return { ok: false, stub: true, reason: "no-session" };
      return { ok: true, stub: false, url: session.url, sessionId: session.id, offer, mode: "payment" };
    }

    const entryId = env.stripeStandardEntryPriceId;
    const monthlyId = env.stripeMonthlyPriceId;
    if (!entryId || !monthlyId) return { ok: false, stub: true, reason: "missing-price" };
    if (isArchivedLifetimePrice(entryId) || isArchivedLifetimePrice(monthlyId)) {
      return { ok: false, stub: true, reason: "archived-lifetime" };
    }
    const [entry, monthly] = await Promise.all([
      stripe.prices.retrieve(entryId),
      stripe.prices.retrieve(monthlyId),
    ]);
    const entryCheck = isApprovedStandardEntryPrice(entry);
    const monthlyCheck = isApprovedMonthlyPrice(monthly);
    if (!entryCheck.ok) return { ok: false, stub: true, reason: entryCheck.reason };
    if (!monthlyCheck.ok) return { ok: false, stub: true, reason: monthlyCheck.reason };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: monthlyId, quantity: 1 },
        { price: entryId, quantity: 1 },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.accountId.slice(0, 200),
      customer_email: input.email || undefined,
      allow_promotion_codes: false,
      metadata,
      subscription_data: { metadata },
    });
    if (!session.url) return { ok: false, stub: true, reason: "no-session" };
    return { ok: true, stub: false, url: session.url, sessionId: session.id, offer, mode: "subscription" };
  } catch {
    return { ok: false, stub: true, reason: "price-unverified" };
  }
}

export function checkoutStubMessage(reason: MembershipCheckoutReason) {
  switch (reason) {
    case "missing-price":
      return "Stripe Checkout is stubbed. Set STRIPE_PRICE_FOUNDING_ENTRY, STRIPE_PRICE_STANDARD_ENTRY, and STRIPE_PRICE_MONTHLY. Nothing was charged.";
    case "livemode-blocked":
      return "Live Stripe keys are blocked on this preview. Use TEST keys. Nothing was charged.";
    case "archived-lifetime":
      return "The archived lifetime Price is not used. Set the Founding / Standard / Monthly Price IDs. Nothing was charged.";
    case "already-active":
      return "Membership is already active.";
    case "price-mismatch":
    case "price-inactive":
      return "A configured Price does not match Founding $5,000, Standard $10,000 entry, or $195/month. Nothing was charged.";
    default:
      return "Stripe Checkout is stubbed until TEST keys and the three Price IDs are set. Nothing is charged.";
  }
}
