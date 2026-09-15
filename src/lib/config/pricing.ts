import { env } from "@/lib/env";
import {
  FOUNDING_ENTRY_LABEL,
  MONTHLY_DUES_LABEL,
  STANDARD_ENTRY_LABEL,
} from "@/lib/copy/community";

/**
 * Membership products. Founding Ten $5,000 one-time.
 * After that: $10,000 entry + $195/month. No discounts. No lifetime-only Price.
 */
export const membershipProducts = {
  founding: {
    id: "founding",
    name: "Founding Ten",
    summary:
      "One payment of $5,000 for the first ten members. The same for everyone. No discounts.",
    priceLabel: env.foundingPriceLabel || FOUNDING_ENTRY_LABEL,
    stripePriceId: env.stripeFoundingEntryPriceId || null,
    checkoutEligible: true,
    interval: "founding" as const,
  },
  standard: {
    id: "standard",
    name: "Membership",
    summary: `After Founding Ten: ${STANDARD_ENTRY_LABEL} to enter, then ${MONTHLY_DUES_LABEL} each month. Cancel dues and the seat ends.`,
    priceLabel: `${env.standardPriceLabel || STANDARD_ENTRY_LABEL} + ${env.monthlyDuesLabel || MONTHLY_DUES_LABEL}/mo`,
    stripePriceId: env.stripeStandardEntryPriceId || null,
    stripeMonthlyPriceId: env.stripeMonthlyPriceId || null,
    checkoutEligible: true,
    interval: "month" as const,
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

export const customerFacingProducts = [
  membershipProducts.founding,
  membershipProducts.standard,
  membershipProducts.organization,
];
