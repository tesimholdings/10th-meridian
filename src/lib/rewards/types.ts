/** Referral Rewards domain. Credit is $1 = $1. Not an investment product. */

export const CREDIT_PER_SUCCESSFUL_REFERRAL_USD = 1_000;
export const CREDIT_USD_RATIO = 1;
export const LIFETIME_MEMBERSHIP_USD = 10_000;
export const ADMISSIONS_MONTHLY_CAP = 10;

export const REFERRAL_PIPELINE = [
  "submitted",
  "invited",
  "applied",
  "admitted",
  "credited",
] as const;

export type ReferralPipelineStatus =
  | (typeof REFERRAL_PIPELINE)[number]
  | "declined"
  | "withdrawn";

export const REFERRAL_EXIT_STATUSES = ["declined", "withdrawn"] as const;

export type RewardCardState = "locked" | "in_progress" | "ready" | "redeemed";

export type RewardKind =
  | "trip"
  | "gold"
  | "table"
  | "yacht"
  | "guest_pass"
  | "founders";

export type RewardFulfillment =
  | "trip_stipend"
  | "editorial_offline"
  | "table_host"
  | "water_day"
  | "guest_pass"
  | "hosted_evening";

export type LedgerKind =
  | "referral_admission"
  | "redemption"
  | "reserve_release";

export type ReservationStatus = "active" | "funded" | "cancelled" | "consumed";

export type RedemptionStatus =
  | "requested"
  | "approved"
  | "paid"
  | "fulfilled_offline"
  | "cancelled";

export interface RewardCatalogItem {
  id: string;
  title: string;
  short: string;
  description: string;
  costUsd: number;
  unlockCreditsRequired: number;
  reservable: boolean;
  kind: RewardKind;
  fulfillment: RewardFulfillment;
  editorial: boolean;
}

export interface MemberReferral {
  id: string;
  referrerId: string;
  fullName: string;
  email: string;
  linkedin?: string;
  city: string;
  howYouKnowThem: string;
  note?: string;
  status: ReferralPipelineStatus;
  credited: boolean;
  creditedAt?: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface CreditLedgerEntry {
  id: string;
  memberId: string;
  amountUsd: number;
  kind: LedgerKind;
  referralId?: string;
  redemptionId?: string;
  reservationId?: string;
  memo: string;
  createdAt: string;
  isDemo: boolean;
}

export interface RewardReservation {
  id: string;
  memberId: string;
  rewardId: string;
  costUsd: number;
  lockedUsd: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface RewardRedemption {
  id: string;
  memberId: string;
  rewardId: string;
  amountUsd: number;
  status: RedemptionStatus;
  destination?: string;
  startDate?: string;
  endDate?: string;
  guestName?: string;
  shippingName?: string;
  shippingCity?: string;
  shippingRegion?: string;
  shippingCountry?: string;
  editorialNote: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface RewardsState {
  referrals: MemberReferral[];
  ledger: CreditLedgerEntry[];
  reservations: RewardReservation[];
  redemptions: RewardRedemption[];
}

export interface RewardCardView {
  item: RewardCatalogItem;
  state: RewardCardState;
  progressUsd: number;
  costUsd: number;
  progressLabel: string;
  reservedUsd: number;
  reservation: RewardReservation | null;
  redemption: RewardRedemption | null;
  canReserve: boolean;
  canCancelReserve: boolean;
  canRedeem: boolean;
}

export interface RewardsSnapshot {
  memberId: string;
  code: string;
  token: string;
  link: string;
  earnedUsd: number;
  reservedUsd: number;
  redeemedUsd: number;
  availableUsd: number;
  earnedCredits: number;
  admissionsCap: number;
  cards: RewardCardView[];
  referrals: MemberReferral[];
  ledger: CreditLedgerEntry[];
  reservations: RewardReservation[];
  redemptions: RewardRedemption[];
}
