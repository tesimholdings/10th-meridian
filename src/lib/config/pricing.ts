import { env } from "@/lib/env";
import { LIFETIME_PRICE_LABEL } from "@/lib/copy/community";

/**
 * Membership products. Lifetime $10,000 is approved.
 * Monthly billing is deferred — do not build or display a monthly price.
 */
export const membershipProducts = {
  lifetime: {
    id: "lifetime",
    name: "Lifetime Membership",
    summary:
      "One payment. The house, the Index, Channels, and Crossings — for as long as the house stands. Monthly billing is not offered yet.",
    priceLabel: env.lifetimePriceLabel || LIFETIME_PRICE_LABEL,
    stripePriceId: env.stripeLifetimePriceId || null,
    checkoutEligible: true,
    interval: "lifetime" as const,
  },
  organization: {
    id: "organization",
    name: "Organization / Strategic Partnership",
    summary: "Considered by application. Not a public checkout product.",
    priceLabel: "By application",
    stripePriceId: null,
    checkoutEligible: false,
    interval: "application" as const,
  },
} as const;

export type MembershipProductId = keyof typeof membershipProducts;

export const customerFacingProducts = [membershipProducts.lifetime, membershipProducts.organization];
