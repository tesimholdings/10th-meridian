import { CREDIT_PER_SUCCESSFUL_REFERRAL_USD, REFERRAL_PIPELINE, USD_PER_POINT } from "@/lib/rewards/types";
import type {
  CreditLedgerEntry,
  MemberReferral,
  ReferralPipelineStatus,
  RewardCardState,
  RewardCatalogItem,
  RewardRedemption,
  RewardReservation,
  RewardCardView,
} from "@/lib/rewards/types";

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function pointsFromUsd(usd: number): number {
  return Math.round(usd / USD_PER_POINT);
}

export function usdFromPoints(points: number): number {
  return points * USD_PER_POINT;
}

export function formatPoints(points: number): string {
  return `${points} ${points === 1 ? "pt" : "pts"}`;
}

export function progressLabel(progressUsd: number, costUsd: number): string {
  return `${formatPoints(pointsFromUsd(progressUsd))} of ${formatPoints(pointsFromUsd(costUsd))}`;
}

export function earnedCreditsFromUsd(earnedUsd: number): number {
  return Math.floor(Math.max(0, earnedUsd) / CREDIT_PER_SUCCESSFUL_REFERRAL_USD);
}

export function canGrantAdmissionCredit(referral: Pick<MemberReferral, "status" | "credited">): boolean {
  if (referral.credited) return false;
  return referral.status === "admitted" || referral.status === "credited";
}

export function shouldGrantCreditOnTransition(
  next: ReferralPipelineStatus,
  credited: boolean,
): boolean {
  if (credited) return false;
  return next === "admitted" || next === "credited";
}

export function nextReferralStatus(
  current: ReferralPipelineStatus,
): ReferralPipelineStatus | null {
  if (current === "declined" || current === "withdrawn" || current === "credited") {
    return null;
  }
  const index = REFERRAL_PIPELINE.indexOf(current);
  if (index < 0 || index >= REFERRAL_PIPELINE.length - 1) return null;
  return REFERRAL_PIPELINE[index + 1];
}

export function isOpenReferralStatus(status: ReferralPipelineStatus): boolean {
  return status !== "declined" && status !== "withdrawn" && status !== "credited";
}

export function sumEarnedUsd(ledger: Pick<CreditLedgerEntry, "amountUsd">[]): number {
  return ledger.filter((row) => row.amountUsd > 0).reduce((n, row) => n + row.amountUsd, 0);
}

export function sumRedeemedUsd(ledger: Pick<CreditLedgerEntry, "amountUsd" | "kind">[]): number {
  return ledger
    .filter((row) => row.kind === "redemption")
    .reduce((n, row) => n + Math.abs(row.amountUsd), 0);
}

export function activeReservations(
  reservations: RewardReservation[],
): RewardReservation[] {
  return reservations.filter((row) => row.status === "active" || row.status === "funded");
}

export function sumReservedUsd(reservations: RewardReservation[]): number {
  return activeReservations(reservations).reduce((n, row) => n + row.lockedUsd, 0);
}

export function availableBalanceUsd(
  ledger: CreditLedgerEntry[],
  reservations: RewardReservation[],
): number {
  const earned = sumEarnedUsd(ledger);
  const redeemed = sumRedeemedUsd(ledger);
  const reserved = sumReservedUsd(reservations);
  return Math.max(0, earned - redeemed - reserved);
}

/** Lock as much available credit as will fit the remaining cost. Zero is allowed. */
export function lockTowardCost(availableUsd: number, alreadyLockedUsd: number, costUsd: number): {
  lockedUsd: number;
  appliedUsd: number;
  funded: boolean;
} {
  const remaining = Math.max(0, costUsd - alreadyLockedUsd);
  const appliedUsd = Math.min(Math.max(0, availableUsd), remaining);
  const lockedUsd = alreadyLockedUsd + appliedUsd;
  return {
    lockedUsd,
    appliedUsd,
    funded: lockedUsd >= costUsd,
  };
}

export function applyIncomingCreditToReservations<T extends RewardReservation>(
  reservations: T[],
  incomingUsd: number,
): { reservations: T[]; leftoverUsd: number } {
  let leftover = Math.max(0, incomingUsd);
  const next = reservations.map((row) => {
    if (leftover <= 0) return row;
    if (row.status !== "active" && row.status !== "funded") return row;
    if (row.lockedUsd >= row.costUsd) return { ...row, status: "funded" as const };
    const applied = lockTowardCost(leftover, row.lockedUsd, row.costUsd);
    leftover -= applied.appliedUsd;
    return {
      ...row,
      lockedUsd: applied.lockedUsd,
      status: applied.funded ? ("funded" as const) : row.status,
    };
  });
  return { reservations: next, leftoverUsd: leftover };
}

export function canReserveReward(input: {
  item: Pick<RewardCatalogItem, "reservable" | "id">;
  reservations: RewardReservation[];
  redeemed: boolean;
}): boolean {
  if (!input.item.reservable || input.redeemed) return false;
  return !activeReservations(input.reservations).some((row) => row.rewardId === input.item.id);
}

export function canRedeemReward(input: {
  item: Pick<RewardCatalogItem, "costUsd" | "unlockCreditsRequired">;
  earnedCredits: number;
  availableUsd: number;
  reservedUsdForThis: number;
  redeemed: boolean;
}): boolean {
  if (input.redeemed) return false;
  if (input.earnedCredits < input.item.unlockCreditsRequired) return false;
  return input.availableUsd + input.reservedUsdForThis >= input.item.costUsd;
}

export function rewardCardState(input: {
  item: Pick<RewardCatalogItem, "costUsd" | "unlockCreditsRequired" | "reservable">;
  earnedCredits: number;
  availableUsd: number;
  reservedUsdForThis: number;
  redeemed: boolean;
  reserved?: boolean;
}): { state: RewardCardState; progressUsd: number } {
  if (input.redeemed) {
    return { state: "redeemed", progressUsd: input.item.costUsd };
  }

  const thresholdMet = input.earnedCredits >= input.item.unlockCreditsRequired;
  const reserved = Boolean(input.reserved) || input.reservedUsdForThis > 0;
  const progressUsd = reserved
    ? Math.min(input.item.costUsd, input.reservedUsdForThis)
    : thresholdMet
      ? Math.min(input.item.costUsd, input.availableUsd)
      : 0;
  const toward = reserved ? input.reservedUsdForThis : thresholdMet ? input.availableUsd : 0;

  if (thresholdMet && toward >= input.item.costUsd) {
    return { state: "ready", progressUsd: input.item.costUsd };
  }
  if (reserved || (thresholdMet && progressUsd > 0 && progressUsd < input.item.costUsd)) {
    return { state: "in_progress", progressUsd };
  }
  return { state: "locked", progressUsd };
}

export function buildRewardCard(
  item: RewardCatalogItem,
  input: {
    earnedCredits: number;
    availableUsd: number;
    reservations: RewardReservation[];
    redemptions: RewardRedemption[];
  },
): RewardCardView {
  const reservation =
    activeReservations(input.reservations).find((row) => row.rewardId === item.id) ?? null;
  const redemption =
    input.redemptions.find(
      (row) => row.rewardId === item.id && row.status !== "cancelled",
    ) ?? null;
  const reservedUsd = reservation?.lockedUsd ?? 0;
  const redeemed = Boolean(redemption);
  const { state, progressUsd } = rewardCardState({
    item,
    earnedCredits: input.earnedCredits,
    availableUsd: input.availableUsd,
    reservedUsdForThis: reservedUsd,
    redeemed,
    reserved: Boolean(reservation),
  });

  return {
    item,
    state,
    progressUsd,
    progressPoints: pointsFromUsd(progressUsd),
    costUsd: item.costUsd,
    costPoints: item.costPoints,
    progressLabel: progressLabel(progressUsd, item.costUsd),
    reservedUsd,
    reservedPoints: pointsFromUsd(reservedUsd),
    reservation,
    redemption,
    canReserve: canReserveReward({ item, reservations: input.reservations, redeemed }),
    canCancelReserve: Boolean(reservation && reservation.status !== "consumed"),
    canRedeem: canRedeemReward({
      item,
      earnedCredits: input.earnedCredits,
      availableUsd: input.availableUsd,
      reservedUsdForThis: reservedUsd,
      redeemed,
    }),
  };
}

export function creditAlreadyGrantedForReferral(
  ledger: CreditLedgerEntry[],
  referralId: string,
): boolean {
  return ledger.some(
    (row) => row.kind === "referral_admission" && row.referralId === referralId && row.amountUsd > 0,
  );
}
