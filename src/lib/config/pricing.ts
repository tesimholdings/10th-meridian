import { env } from "@/lib/env";

/**
 * Membership products. Amounts are NEVER invented.
 * Display copy stays as approved-price placeholders until finance signs off.
 */
export const membershipProducts = {
  founding: {
    id: "founding",
    name: "Founding Membership",
    summary:
      "A limited founding cohort, with a preferential annual rate while continuously active.",
    priceLabel: env.foundingPriceLabel,
    stripePriceId: env.stripeFoundingPriceId || null,
    checkoutEligible: true,
  },
  standard: {
    id: "standard",
    name: "Standard Membership",
    summary:
      "Full platform access: The Meridian 10 and 100, directory, channels and DMs, introductions, gatherings, and resources.",
    priceLabel: env.standardPriceLabel,
    stripePriceId: env.stripeStandardPriceId || null,
    checkoutEligible: true,
  },
  organization: {
    id: "organization",
    name: "Organization / Strategic Partnership",
    summary: "Considered by application. Not a public checkout product.",
    priceLabel: "By application",
    stripePriceId: null,
    checkoutEligible: false,
  },
} as const;

export type MembershipProductId = keyof typeof membershipProducts;
