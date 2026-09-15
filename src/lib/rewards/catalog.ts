import { CREDIT_PER_SUCCESSFUL_REFERRAL_USD } from "@/lib/rewards/types";
import type { RewardCatalogItem } from "@/lib/rewards/types";

/**
 * Starter redemption catalog. Add items here — UI and math read this list.
 * Costs are Meridian Credit dollars ($1 = $1). Editorial fulfillment only.
 */
export const REWARD_CATALOG: readonly RewardCatalogItem[] = [
  {
    id: "trip-credit",
    title: "Trip credit",
    short: "Crossing stipend",
    description:
      "Toward a Meridian Crossing or Open House travel stipend. Submit a destination and dates. Ops marks requested → approved → paid. Not a booked itinerary.",
    costUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "trip",
    fulfillment: "trip_stipend",
    editorial: true,
  },
  {
    id: "gold-bar",
    title: "Gold bar",
    short: "$1,000 toward",
    description:
      "Reserve even before the balance is full. Reserved credit locks here until funded or you cancel. Shipping is a stub — ops fulfills offline. Imagery is editorial, not delivered gold.",
    costUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
    unlockCreditsRequired: 1,
    reservable: true,
    kind: "gold",
    fulfillment: "editorial_offline",
    editorial: true,
  },
  {
    id: "open-table",
    title: "Open a Table",
    short: "Host credit",
    description:
      "Host credit for a private dinner or table. The house fulfills offline. Not a public reservation system.",
    costUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "table",
    fulfillment: "table_host",
    editorial: true,
  },
  {
    id: "yacht-day",
    title: "Yacht day",
    short: "Water day credit",
    description:
      "Toward a Meridian water experience. Ops fulfills. Editorial imagery — not a completed day on the water.",
    costUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "yacht",
    fulfillment: "water_day",
    editorial: true,
  },
  {
    id: "guest-pass",
    title: "Guest Open House pass",
    short: "One guest, one night",
    description:
      "One-time guest access for a referred friend to an Open House. Not membership. Not a transfer of the $10,000 lifetime seat.",
    costUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "guest_pass",
    fulfillment: "guest_pass",
    editorial: true,
  },
  {
    id: "founders-circle",
    title: "Founders Circle",
    short: "Hosted evening",
    description:
      "Exclusive hosted evening. Locked until three successful referrals ($3,000 earned). Ops fulfills offline.",
    costUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD * 3,
    unlockCreditsRequired: 3,
    reservable: false,
    kind: "founders",
    fulfillment: "hosted_evening",
    editorial: true,
  },
] as const;

export function catalogById(id: string): RewardCatalogItem | undefined {
  return REWARD_CATALOG.find((item) => item.id === id);
}
