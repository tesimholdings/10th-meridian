import { POINTS_PER_SUCCESSFUL_REFERRAL, USD_PER_POINT } from "@/lib/rewards/types";
import type { RewardCatalogItem } from "@/lib/rewards/types";

function item(partial: Omit<RewardCatalogItem, "costUsd">): RewardCatalogItem {
  return { ...partial, costUsd: partial.costPoints * USD_PER_POINT };
}

/**
 * Starter redemption catalog. Add items here — UI and math read this list.
 * Costs are points. 10 pts = $1,000 toward redemptions. Editorial fulfillment only.
 */
export const REWARD_CATALOG: readonly RewardCatalogItem[] = [
  item({
    id: "trip-credit",
    title: "Trip credit",
    short: "10 pts · Crossing stipend",
    description:
      "Toward a Meridian Crossing or Open House travel stipend. Submit a destination and dates. Ops marks requested → approved → paid. Not a booked itinerary.",
    costPoints: POINTS_PER_SUCCESSFUL_REFERRAL,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "trip",
    fulfillment: "trip_stipend",
    editorial: true,
  }),
  item({
    id: "gold-bar",
    title: "Gold bar",
    short: "10 pts toward",
    description:
      "Reserve even before the balance is full. Reserved points lock here until funded or you cancel. Shipping is a stub — ops fulfills offline. Imagery is editorial, not delivered gold.",
    costPoints: POINTS_PER_SUCCESSFUL_REFERRAL,
    unlockCreditsRequired: 1,
    reservable: true,
    kind: "gold",
    fulfillment: "editorial_offline",
    editorial: true,
  }),
  item({
    id: "open-table",
    title: "Open a Table",
    short: "10 pts · Host credit",
    description:
      "Host credit for a private dinner or table. The house fulfills offline. Not a public reservation system.",
    costPoints: POINTS_PER_SUCCESSFUL_REFERRAL,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "table",
    fulfillment: "table_host",
    editorial: true,
  }),
  item({
    id: "yacht-day",
    title: "Yacht day",
    short: "10 pts · Water day",
    description:
      "Toward a Meridian water experience. Ops fulfills. Editorial imagery — not a completed day on the water.",
    costPoints: POINTS_PER_SUCCESSFUL_REFERRAL,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "yacht",
    fulfillment: "water_day",
    editorial: true,
  }),
  item({
    id: "guest-pass",
    title: "Guest Open House pass",
    short: "10 pts · One guest",
    description:
      "One-time guest access for a referred friend to an Open House. Not membership. Not a transfer of the $10,000 lifetime seat.",
    costPoints: POINTS_PER_SUCCESSFUL_REFERRAL,
    unlockCreditsRequired: 1,
    reservable: false,
    kind: "guest_pass",
    fulfillment: "guest_pass",
    editorial: true,
  }),
  item({
    id: "founders-circle",
    title: "Founders Circle",
    short: "30 pts · Hosted evening",
    description:
      "Exclusive hosted evening. Locked until three successful referrals (30 pts / $3,000). Ops fulfills offline.",
    costPoints: POINTS_PER_SUCCESSFUL_REFERRAL * 3,
    unlockCreditsRequired: 3,
    reservable: false,
    kind: "founders",
    fulfillment: "hosted_evening",
    editorial: true,
  }),
];

export function catalogById(id: string): RewardCatalogItem | undefined {
  return REWARD_CATALOG.find((row) => row.id === id);
}
