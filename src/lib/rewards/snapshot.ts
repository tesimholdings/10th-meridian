import { REWARD_CATALOG } from "@/lib/rewards/catalog";
import { memberReferralCode, memberReferralLink, memberReferralToken } from "@/lib/rewards/identity";
import {
  availableBalanceUsd,
  buildRewardCard,
  earnedCreditsFromUsd,
  sumEarnedUsd,
  sumRedeemedUsd,
  sumReservedUsd,
} from "@/lib/rewards/math";
import { ADMISSIONS_MONTHLY_CAP, type RewardsSnapshot, type RewardsState } from "@/lib/rewards/types";

export function buildRewardsSnapshot(input: {
  member: { id: string; displayName: string; initials: string };
  state: RewardsState;
  siteUrl?: string;
  admissionsCap?: number;
}): RewardsSnapshot {
  const memberId = input.member.id;
  const referrals = input.state.referrals.filter((row) => row.referrerId === memberId);
  const ledger = input.state.ledger.filter((row) => row.memberId === memberId);
  const reservations = input.state.reservations.filter((row) => row.memberId === memberId);
  const redemptions = input.state.redemptions.filter((row) => row.memberId === memberId);
  const earnedUsd = sumEarnedUsd(ledger);
  const reservedUsd = sumReservedUsd(reservations);
  const redeemedUsd = sumRedeemedUsd(ledger);
  const availableUsd = availableBalanceUsd(ledger, reservations);
  const earnedCredits = earnedCreditsFromUsd(earnedUsd);
  const code = memberReferralCode(input.member);

  return {
    memberId,
    code,
    token: memberReferralToken(memberId),
    link: memberReferralLink(code, input.siteUrl),
    earnedUsd,
    reservedUsd,
    redeemedUsd,
    availableUsd,
    earnedCredits,
    admissionsCap: input.admissionsCap ?? ADMISSIONS_MONTHLY_CAP,
    cards: REWARD_CATALOG.map((item) =>
      buildRewardCard(item, { earnedCredits, availableUsd, reservations, redemptions }),
    ),
    referrals: referrals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    ledger: ledger.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    reservations,
    redemptions: redemptions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };
}
