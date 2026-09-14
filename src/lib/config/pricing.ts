import { env } from "@/lib/env";

/**
 * Approved public membership. Stefan, 2026-09-14:
 * Lifetime — $10,000 one-time. No monthly product in the public section yet.
 * Organization / Strategic Partnership remains by application.
 */
export const LIFETIME_AMOUNT_USD = 10_000;
export const LIFETIME_PRICE_LABEL = "$10,000";

export const membershipProducts = {
  lifetime: {
    id: "lifetime",
    name: "Lifetime Membership",
    summary:
      "One-time membership. Full house access: The Meridian 10 and 100, directory, channels and DMs, introductions, gatherings, and resources.",
    priceLabel: env.lifetimePriceLabel,
    cadence: "one-time",
    stripePriceId: env.stripeLifetimePriceId || null,
    checkoutEligible: true,
  },
  organization: {
    id: "organization",
    name: "Organization / Strategic Partnership",
    summary: "Considered by application. Not a public checkout product.",
    priceLabel: "By application",
    cadence: "application",
    stripePriceId: null,
    checkoutEligible: false,
  },
} as const;

export type MembershipProductId = keyof typeof membershipProducts;

export function resolveCheckoutProduct(raw: string): MembershipProductId | null {
  if (raw === "lifetime" || raw === "founding" || raw === "standard") return "lifetime";
  if (raw === "organization") return "organization";
  return null;
}
