import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REWARD_CATALOG, catalogById } from "@/lib/rewards/catalog";
import { memberReferralCode, memberReferralLink, memberReferralToken } from "@/lib/rewards/identity";
import {
  applyIncomingCreditToReservations,
  availableBalanceUsd,
  buildRewardCard,
  canGrantAdmissionCredit,
  canRedeemReward,
  canReserveReward,
  creditAlreadyGrantedForReferral,
  earnedCreditsFromUsd,
  lockTowardCost,
  nextReferralStatus,
  progressLabel,
  rewardCardState,
  shouldGrantCreditOnTransition,
  sumEarnedUsd,
  sumRedeemedUsd,
  sumReservedUsd,
} from "@/lib/rewards/math";
import {
  ADMISSIONS_MONTHLY_CAP,
  CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
  CREDIT_USD_RATIO,
  LIFETIME_MEMBERSHIP_USD,
  type CreditLedgerEntry,
  type RewardReservation,
} from "@/lib/rewards/types";

function ledger(amountUsd: number, kind: CreditLedgerEntry["kind"] = "referral_admission", referralId?: string): CreditLedgerEntry {
  return {
    id: `led-${amountUsd}-${kind}`,
    memberId: "demo-01",
    amountUsd,
    kind,
    referralId,
    memo: "test",
    createdAt: "2026-09-14T00:00:00.000Z",
    isDemo: true,
  };
}

function reservation(partial: Partial<RewardReservation> & Pick<RewardReservation, "lockedUsd" | "costUsd">): RewardReservation {
  return {
    id: partial.id ?? "res-1",
    memberId: "demo-01",
    rewardId: partial.rewardId ?? "gold-bar",
    costUsd: partial.costUsd,
    lockedUsd: partial.lockedUsd,
    status: partial.status ?? "active",
    createdAt: "2026-09-14T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
    isDemo: true,
  };
}

describe("Referral Rewards credit math", () => {
  it("keeps $1 = $1 and the locked prices", () => {
    assert.equal(CREDIT_USD_RATIO, 1);
    assert.equal(CREDIT_PER_SUCCESSFUL_REFERRAL_USD, 1_000);
    assert.equal(LIFETIME_MEMBERSHIP_USD, 10_000);
    assert.equal(ADMISSIONS_MONTHLY_CAP, 10);
    assert.equal(earnedCreditsFromUsd(3_000), 3);
    assert.equal(progressLabel(0, 1_000), "$0 of $1,000");
  });

  it("grants +$1,000 once when a referral is admitted", () => {
    assert.equal(canGrantAdmissionCredit({ status: "applied", credited: false }), false);
    assert.equal(canGrantAdmissionCredit({ status: "admitted", credited: false }), true);
    assert.equal(canGrantAdmissionCredit({ status: "admitted", credited: true }), false);
    assert.equal(canGrantAdmissionCredit({ status: "credited", credited: true }), false);
    assert.equal(shouldGrantCreditOnTransition("admitted", false), true);
    assert.equal(shouldGrantCreditOnTransition("credited", false), true);
    assert.equal(shouldGrantCreditOnTransition("admitted", true), false);
    assert.equal(shouldGrantCreditOnTransition("declined", false), false);
    assert.equal(shouldGrantCreditOnTransition("withdrawn", false), false);
  });

  it("walks Submitted → Invited → Applied → Admitted → Credited", () => {
    assert.equal(nextReferralStatus("submitted"), "invited");
    assert.equal(nextReferralStatus("invited"), "applied");
    assert.equal(nextReferralStatus("applied"), "admitted");
    assert.equal(nextReferralStatus("admitted"), "credited");
    assert.equal(nextReferralStatus("credited"), null);
    assert.equal(nextReferralStatus("declined"), null);
    assert.equal(nextReferralStatus("withdrawn"), null);
  });

  it("does not invent extra catalog FX or membership prices", () => {
    for (const item of REWARD_CATALOG) {
      assert.ok(item.costUsd === 1_000 || item.costUsd === 3_000, item.id);
      assert.equal(item.editorial, true);
    }
    assert.equal(catalogById("founders-circle")?.unlockCreditsRequired, 3);
    assert.equal(catalogById("gold-bar")?.reservable, true);
  });

  it("computes available = earned − redeemed − reserved", () => {
    const rows = [ledger(1_000, "referral_admission", "r1"), ledger(1_000, "referral_admission", "r2")];
    assert.equal(sumEarnedUsd(rows), 2_000);
    const withSpend = [...rows, ledger(-1_000, "redemption")];
    assert.equal(sumRedeemedUsd(withSpend), 1_000);
    const reserved = [reservation({ lockedUsd: 400, costUsd: 1_000 })];
    assert.equal(sumReservedUsd(reserved), 400);
    assert.equal(availableBalanceUsd(withSpend, reserved), 600);
    assert.equal(
      creditAlreadyGrantedForReferral(rows, "r1"),
      true,
    );
    assert.equal(creditAlreadyGrantedForReferral(rows, "r-missing"), false);
  });

  it("lets a member reserve gold before the balance is full and locks credit to it", () => {
    const gold = catalogById("gold-bar")!;
    assert.equal(
      canReserveReward({ item: gold, reservations: [], redeemed: false }),
      true,
    );
    const first = lockTowardCost(400, 0, 1_000);
    assert.deepEqual(first, { lockedUsd: 400, appliedUsd: 400, funded: false });
    const empty = lockTowardCost(0, 0, 1_000);
    assert.deepEqual(empty, { lockedUsd: 0, appliedUsd: 0, funded: false });
    const funded = lockTowardCost(1_200, 0, 1_000);
    assert.equal(funded.funded, true);
    assert.equal(funded.lockedUsd, 1_000);

    const applied = applyIncomingCreditToReservations(
      [reservation({ lockedUsd: 400, costUsd: 1_000, status: "active" })],
      1_000,
    );
    assert.equal(applied.reservations[0].lockedUsd, 1_000);
    assert.equal(applied.reservations[0].status, "funded");
    assert.equal(applied.leftoverUsd, 400);

    assert.equal(
      canReserveReward({
        item: gold,
        reservations: [reservation({ lockedUsd: 0, costUsd: 1_000, status: "active" })],
        redeemed: false,
      }),
      false,
    );
  });

  it("cancelling a reservation releases the lock back to available", () => {
    const rows = [ledger(1_000)];
    const live = [reservation({ lockedUsd: 1_000, costUsd: 1_000, status: "active" })];
    assert.equal(availableBalanceUsd(rows, live), 0);
    const cancelled = [{ ...live[0], status: "cancelled" as const, lockedUsd: 0 }];
    assert.equal(availableBalanceUsd(rows, cancelled), 1_000);
  });

  it("unlocks Founders Circle only after three credits", () => {
    const founders = catalogById("founders-circle")!;
    const locked = rewardCardState({
      item: founders,
      earnedCredits: 1,
      availableUsd: 1_000,
      reservedUsdForThis: 0,
      redeemed: false,
    });
    assert.equal(locked.state, "locked");
    assert.equal(locked.progressUsd, 0);

    const ready = rewardCardState({
      item: founders,
      earnedCredits: 3,
      availableUsd: 3_000,
      reservedUsdForThis: 0,
      redeemed: false,
    });
    assert.equal(ready.state, "ready");
    assert.equal(
      canRedeemReward({
        item: founders,
        earnedCredits: 3,
        availableUsd: 3_000,
        reservedUsdForThis: 0,
        redeemed: false,
      }),
      true,
    );
    assert.equal(
      canRedeemReward({
        item: founders,
        earnedCredits: 2,
        availableUsd: 3_000,
        reservedUsdForThis: 0,
        redeemed: false,
      }),
      false,
    );
  });

  it("shows $0-reserved gold as in progress, not ready", () => {
    const gold = catalogById("gold-bar")!;
    const view = rewardCardState({
      item: gold,
      earnedCredits: 0,
      availableUsd: 0,
      reservedUsdForThis: 0,
      redeemed: false,
      reserved: true,
    });
    assert.equal(view.state, "in_progress");
    assert.equal(view.progressUsd, 0);
  });

  it("builds catalog cards with correct ready / redeemed states", () => {
    const trip = catalogById("trip-credit")!;
    const card = buildRewardCard(trip, {
      earnedCredits: 1,
      availableUsd: 1_000,
      reservations: [],
      redemptions: [],
    });
    assert.equal(card.state, "ready");
    assert.equal(card.progressLabel, "$1,000 of $1,000");
    assert.equal(card.canRedeem, true);

    const spent = buildRewardCard(trip, {
      earnedCredits: 1,
      availableUsd: 0,
      reservations: [],
      redemptions: [
        {
          id: "red-1",
          memberId: "demo-01",
          rewardId: "trip-credit",
          amountUsd: 1_000,
          status: "requested",
          editorialNote: "test",
          createdAt: "2026-09-14T00:00:00.000Z",
          updatedAt: "2026-09-14T00:00:00.000Z",
          isDemo: true,
        },
      ],
    });
    assert.equal(spent.state, "redeemed");
    assert.equal(spent.canRedeem, false);
  });

  it("keeps a demo-stable personal code per member", () => {
    assert.equal(memberReferralCode({ id: "demo-01", displayName: "A. Voss", initials: "AV" }), "VOSS-10");
    assert.equal(memberReferralCode({ id: "demo-01", displayName: "A. Voss", initials: "AV" }), "VOSS-10");
    assert.equal(memberReferralToken("demo-01"), "member-demo-01");
    assert.match(memberReferralLink("VOSS-10", "https://tenmeridian.com"), /\/referral\/VOSS-10$/);
  });
});
