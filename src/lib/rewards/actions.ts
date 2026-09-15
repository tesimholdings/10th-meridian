import { catalogById } from "@/lib/rewards/catalog";
import {
  applyIncomingCreditToReservations,
  availableBalanceUsd,
  canRedeemReward,
  canReserveReward,
  creditAlreadyGrantedForReferral,
  earnedCreditsFromUsd,
  lockTowardCost,
  nextReferralStatus,
  shouldGrantCreditOnTransition,
  sumEarnedUsd,
} from "@/lib/rewards/math";
import { CREDIT_PER_SUCCESSFUL_REFERRAL_USD, POINTS_PER_SUCCESSFUL_REFERRAL } from "@/lib/rewards/types";
import type {
  CreditLedgerEntry,
  MemberReferral,
  RedemptionStatus,
  RewardRedemption,
  RewardReservation,
  RewardsState,
} from "@/lib/rewards/types";

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function cloneState(state: RewardsState): RewardsState {
  return {
    referrals: state.referrals.map((row) => ({ ...row })),
    ledger: state.ledger.map((row) => ({ ...row })),
    reservations: state.reservations.map((row) => ({ ...row })),
    redemptions: state.redemptions.map((row) => ({ ...row })),
  };
}

function grantAdmissionCredit(state: RewardsState, referral: MemberReferral): RewardsState {
  if (referral.credited || creditAlreadyGrantedForReferral(state.ledger, referral.id)) {
    referral.credited = true;
    referral.status = "credited";
    return state;
  }

  const incoming = CREDIT_PER_SUCCESSFUL_REFERRAL_USD;
  const allocated = applyIncomingCreditToReservations(
    state.reservations.filter((row) => row.memberId === referral.referrerId),
    incoming,
  );
  const others = state.reservations.filter((row) => row.memberId !== referral.referrerId);
  state.reservations = [...others, ...allocated.reservations];

  const entry: CreditLedgerEntry = {
    id: id("led"),
    memberId: referral.referrerId,
    amountUsd: incoming,
    kind: "referral_admission",
    referralId: referral.id,
    memo: `Admitted through your referral. +${POINTS_PER_SUCCESSFUL_REFERRAL} pts ($${incoming.toLocaleString("en-US")} toward redemptions).`,
    createdAt: nowIso(),
    isDemo: true,
  };
  state.ledger.unshift(entry);
  referral.credited = true;
  referral.creditedAt = entry.createdAt;
  referral.status = "credited";
  referral.updatedAt = entry.createdAt;
  return state;
}

export function submitReferral(
  state: RewardsState,
  input: {
    referrerId: string;
    fullName: string;
    email: string;
    linkedin?: string;
    city: string;
    howYouKnowThem: string;
    note?: string;
  },
): { ok: true; referral: MemberReferral; state: RewardsState } | { ok: false; message: string } {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const city = input.city.trim();
  const howYouKnowThem = input.howYouKnowThem.trim();
  if (fullName.length < 2) return { ok: false, message: "A full name is required." };
  if (!email.includes("@")) return { ok: false, message: "A real email is required." };
  if (city.length < 2) return { ok: false, message: "City is required." };
  if (howYouKnowThem.length < 8) return { ok: false, message: "Say briefly how you know them." };
  if (
    state.referrals.some(
      (row) =>
        row.referrerId === input.referrerId &&
        row.email === email &&
        row.status !== "declined" &&
        row.status !== "withdrawn",
    )
  ) {
    return { ok: false, message: "You already have an open referral for that person." };
  }

  const next = cloneState(state);
  const referral: MemberReferral = {
    id: id("mref"),
    referrerId: input.referrerId,
    fullName,
    email,
    linkedin: input.linkedin?.trim() || undefined,
    city,
    howYouKnowThem,
    note: input.note?.trim() || undefined,
    status: "submitted",
    credited: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDemo: true,
  };
  next.referrals.unshift(referral);
  return { ok: true, referral, state: next };
}

export function withdrawReferral(
  state: RewardsState,
  input: { memberId: string; referralId: string },
): { ok: true; referral: MemberReferral; state: RewardsState } | { ok: false; message: string } {
  const next = cloneState(state);
  const referral = next.referrals.find(
    (row) => row.id === input.referralId && row.referrerId === input.memberId,
  );
  if (!referral) return { ok: false, message: "Referral not found." };
  if (referral.credited || referral.status === "credited") {
    return { ok: false, message: "A credited referral cannot be withdrawn." };
  }
  if (referral.status === "declined" || referral.status === "withdrawn") {
    return { ok: false, message: "That referral is already closed." };
  }
  referral.status = "withdrawn";
  referral.updatedAt = nowIso();
  return { ok: true, referral, state: next };
}

export function advanceReferral(
  state: RewardsState,
  input: { memberId: string; referralId: string; to?: "declined" },
): { ok: true; referral: MemberReferral; state: RewardsState } | { ok: false; message: string } {
  const next = cloneState(state);
  const referral = next.referrals.find(
    (row) => row.id === input.referralId && row.referrerId === input.memberId,
  );
  if (!referral) return { ok: false, message: "Referral not found." };

  if (input.to === "declined") {
    if (referral.credited) return { ok: false, message: "A credited referral cannot be declined." };
    referral.status = "declined";
    referral.updatedAt = nowIso();
    return { ok: true, referral, state: next };
  }

  const upcoming = nextReferralStatus(referral.status);
  if (!upcoming) return { ok: false, message: "That referral cannot move further." };
  referral.status = upcoming;
  referral.updatedAt = nowIso();
  if (shouldGrantCreditOnTransition(upcoming, referral.credited)) {
    grantAdmissionCredit(next, referral);
  }
  return { ok: true, referral, state: next };
}

export function reserveReward(
  state: RewardsState,
  input: { memberId: string; rewardId: string },
): { ok: true; reservation: RewardReservation; state: RewardsState } | { ok: false; message: string } {
  const item = catalogById(input.rewardId);
  if (!item) return { ok: false, message: "That reward is not in the catalog." };
  const next = cloneState(state);
  const redeemed = next.redemptions.some(
    (row) => row.memberId === input.memberId && row.rewardId === item.id && row.status !== "cancelled",
  );
  if (!canReserveReward({ item, reservations: next.reservations.filter((r) => r.memberId === input.memberId), redeemed })) {
    return { ok: false, message: item.reservable ? "Already reserved." : "This reward is requested, not reserved." };
  }

  const available = availableBalanceUsd(
    next.ledger.filter((row) => row.memberId === input.memberId),
    next.reservations.filter((row) => row.memberId === input.memberId),
  );
  const lock = lockTowardCost(available, 0, item.costUsd);
  const reservation: RewardReservation = {
    id: id("rsv"),
    memberId: input.memberId,
    rewardId: item.id,
    costUsd: item.costUsd,
    lockedUsd: lock.lockedUsd,
    status: lock.funded ? "funded" : "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDemo: true,
  };
  next.reservations.unshift(reservation);
  return { ok: true, reservation, state: next };
}

export function cancelReservation(
  state: RewardsState,
  input: { memberId: string; reservationId: string },
): { ok: true; reservation: RewardReservation; state: RewardsState } | { ok: false; message: string } {
  const next = cloneState(state);
  const reservation = next.reservations.find(
    (row) => row.id === input.reservationId && row.memberId === input.memberId,
  );
  if (!reservation) return { ok: false, message: "Reservation not found." };
  if (reservation.status === "consumed") {
    return { ok: false, message: "A fulfilled reservation cannot be cancelled." };
  }
  reservation.status = "cancelled";
  reservation.lockedUsd = 0;
  reservation.updatedAt = nowIso();
  return { ok: true, reservation, state: next };
}

export function requestRedemption(
  state: RewardsState,
  input: {
    memberId: string;
    rewardId: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    guestName?: string;
    shippingName?: string;
    shippingCity?: string;
    shippingRegion?: string;
    shippingCountry?: string;
  },
): { ok: true; redemption: RewardRedemption; state: RewardsState } | { ok: false; message: string } {
  const item = catalogById(input.rewardId);
  if (!item) return { ok: false, message: "That reward is not in the catalog." };

  const next = cloneState(state);
  const ledger = next.ledger.filter((row) => row.memberId === input.memberId);
  const reservations = next.reservations.filter((row) => row.memberId === input.memberId);
  const redemptions = next.redemptions.filter((row) => row.memberId === input.memberId);
  const reservation = reservations.find(
    (row) => row.rewardId === item.id && (row.status === "active" || row.status === "funded"),
  );
  const already = redemptions.find((row) => row.rewardId === item.id && row.status !== "cancelled");
  const available = availableBalanceUsd(ledger, reservations);
  const earnedCredits = earnedCreditsFromUsd(sumEarnedUsd(ledger));

  if (
    !canRedeemReward({
      item,
      earnedCredits,
      availableUsd: available,
      reservedUsdForThis: reservation?.lockedUsd ?? 0,
      redeemed: Boolean(already),
    })
  ) {
    return { ok: false, message: "Not enough points, or this reward is still locked." };
  }

  if (item.fulfillment === "trip_stipend") {
    if (!input.destination?.trim() || !input.startDate || !input.endDate) {
      return { ok: false, message: "Destination and dates are required for trip credit." };
    }
  }
  if (item.kind === "gold") {
    if (!input.shippingName?.trim() || !input.shippingCity?.trim() || !input.shippingCountry?.trim()) {
      return { ok: false, message: "A shipping name, city, and country are required. Fulfillment is offline." };
    }
  }
  if (item.kind === "guest_pass" && !input.guestName?.trim()) {
    return { ok: false, message: "Name the guest. This is not membership." };
  }

  const initialStatus: RedemptionStatus =
    item.fulfillment === "trip_stipend" ? "requested" : "fulfilled_offline";

  const redemption: RewardRedemption = {
    id: id("rdm"),
    memberId: input.memberId,
    rewardId: item.id,
    amountUsd: item.costUsd,
    status: initialStatus,
    destination: input.destination?.trim() || undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    guestName: input.guestName?.trim() || undefined,
    shippingName: input.shippingName?.trim() || undefined,
    shippingCity: input.shippingCity?.trim() || undefined,
    shippingRegion: input.shippingRegion?.trim() || undefined,
    shippingCountry: input.shippingCountry?.trim() || undefined,
    editorialNote:
      "Editorial fulfillment. Ops completes this offline. Imagery does not depict delivered gold or booked travel.",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDemo: true,
  };

  if (reservation) {
    reservation.status = "consumed";
    reservation.updatedAt = redemption.createdAt;
  }

  next.ledger.unshift({
    id: id("led"),
    memberId: input.memberId,
    amountUsd: -item.costUsd,
    kind: "redemption",
    redemptionId: redemption.id,
    reservationId: reservation?.id,
    memo: `Redeemed ${item.title}.`,
    createdAt: redemption.createdAt,
    isDemo: true,
  });
  next.redemptions.unshift(redemption);
  return { ok: true, redemption, state: next };
}

export function advanceRedemption(
  state: RewardsState,
  input: { memberId: string; redemptionId: string },
): { ok: true; redemption: RewardRedemption; state: RewardsState } | { ok: false; message: string } {
  const next = cloneState(state);
  const redemption = next.redemptions.find(
    (row) => row.id === input.redemptionId && row.memberId === input.memberId,
  );
  if (!redemption) return { ok: false, message: "Redemption not found." };
  const order: RedemptionStatus[] = ["requested", "approved", "paid"];
  const index = order.indexOf(redemption.status);
  if (index < 0 || index === order.length - 1) {
    return { ok: false, message: "That redemption cannot move further." };
  }
  redemption.status = order[index + 1];
  redemption.updatedAt = nowIso();
  return { ok: true, redemption, state: next };
}

export function creditReferrerForAdmittedApplication(
  state: RewardsState,
  input: {
    referrerId: string;
    fullName: string;
    email: string;
    city?: string;
  },
): RewardsState {
  const email = input.email.trim().toLowerCase();
  const next = cloneState(state);
  let referral = next.referrals.find(
    (row) => row.referrerId === input.referrerId && row.email === email,
  );
  if (!referral) {
    referral = {
      id: id("mref"),
      referrerId: input.referrerId,
      fullName: input.fullName,
      email,
      city: input.city?.trim() || "—",
      howYouKnowThem: "Joined through your personal referral link.",
      status: "admitted",
      credited: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      isDemo: true,
    };
    next.referrals.unshift(referral);
  }
  if (!referral.credited) {
    referral.status = "admitted";
    grantAdmissionCredit(next, referral);
  }
  return next;
}
