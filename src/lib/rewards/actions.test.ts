import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedRewardsState } from "@/lib/data/rewards-demo";
import {
  advanceReferral,
  cancelReservation,
  creditReferrerForAdmittedApplication,
  requestRedemption,
  reserveReward,
  submitReferral,
  withdrawReferral,
} from "@/lib/rewards/actions";
import { availableBalanceUsd, creditAlreadyGrantedForReferral, pointsFromUsd } from "@/lib/rewards/math";
import type { RewardsState } from "@/lib/rewards/types";

const memberId = "demo-01";

describe("Referral Rewards actions", () => {
  it("seeds one credited referral and a 10-point available balance", () => {
    const seed = seedRewardsState();
    assert.equal(seed.referrals.filter((r) => r.status === "credited").length, 1);
    assert.equal(seed.referrals.filter((r) => r.status === "applied").length, 1);
    assert.equal(availableBalanceUsd(seed.ledger, seed.reservations), 1_000);
    assert.equal(pointsFromUsd(availableBalanceUsd(seed.ledger, seed.reservations)), 10);
  });

  it("credits exactly once when a submitted referral is admitted", () => {
    let state = seedRewardsState();
    const submitted = submitReferral(state, {
      referrerId: memberId,
      fullName: "N. Patel",
      email: "n.patel@example.test",
      city: "Mumbai",
      howYouKnowThem: "Built a product together.",
    });
    assert.equal(submitted.ok, true);
    if (!submitted.ok) return;
    state = submitted.state;
    const current = submitted.referral.id;
    for (const expected of ["invited", "applied", "admitted"] as const) {
      const step = advanceReferral(state, { memberId, referralId: current });
      assert.equal(step.ok, true);
      if (!step.ok) return;
      state = step.state;
      if (expected === "admitted") {
        assert.equal(step.referral.status, "credited");
        assert.equal(step.referral.credited, true);
      }
    }
    assert.equal(availableBalanceUsd(state.ledger, state.reservations), 2_000);
    const again = advanceReferral(state, { memberId, referralId: current });
    assert.equal(again.ok, false);
    assert.equal(
      state.ledger.filter((row) => row.referralId === current && row.kind === "referral_admission").length,
      1,
    );
  });

  it("does not credit declined or withdrawn referrals", () => {
    const state = seedRewardsState();
    const submitted = submitReferral(state, {
      referrerId: memberId,
      fullName: "K. Iyer",
      email: "k.iyer@example.test",
      city: "Bengaluru",
      howYouKnowThem: "A long correspondence.",
    });
    assert.equal(submitted.ok, true);
    if (!submitted.ok) return;
    const declined = advanceReferral(submitted.state, {
      memberId,
      referralId: submitted.referral.id,
      to: "declined",
    });
    assert.equal(declined.ok, true);
    if (!declined.ok) return;
    assert.equal(declined.referral.credited, false);
    assert.equal(availableBalanceUsd(declined.state.ledger, declined.state.reservations), 1_000);

    const withdrawn = withdrawReferral(declined.state, {
      memberId,
      referralId: declined.state.referrals.find((r) => r.status === "applied")!.id,
    });
    assert.equal(withdrawn.ok, true);
    if (!withdrawn.ok) return;
    assert.equal(withdrawn.referral.status, "withdrawn");
    assert.equal(availableBalanceUsd(withdrawn.state.ledger, withdrawn.state.reservations), 1_000);
  });

  it("reserves gold, locks credit, and releases on cancel", () => {
    const reserved = reserveReward(seedRewardsState(), { memberId, rewardId: "gold-bar" });
    assert.equal(reserved.ok, true);
    if (!reserved.ok) return;
    assert.equal(reserved.reservation.lockedUsd, 1_000);
    assert.equal(reserved.reservation.status, "funded");
    assert.equal(availableBalanceUsd(reserved.state.ledger, reserved.state.reservations), 0);

    const cancelled = cancelReservation(reserved.state, {
      memberId,
      reservationId: reserved.reservation.id,
    });
    assert.equal(cancelled.ok, true);
    if (!cancelled.ok) return;
    assert.equal(availableBalanceUsd(cancelled.state.ledger, cancelled.state.reservations), 1_000);
  });

  it("applies a new admission to an underfunded gold reserve", () => {
    let state: RewardsState = {
      referrals: [],
      ledger: [],
      reservations: [],
      redemptions: [],
    };
    const reserved = reserveReward(state, { memberId, rewardId: "gold-bar" });
    assert.equal(reserved.ok, true);
    if (!reserved.ok) return;
    assert.equal(reserved.reservation.lockedUsd, 0);
    state = creditReferrerForAdmittedApplication(reserved.state, {
      referrerId: memberId,
      fullName: "J. Hale",
      email: "j.hale@example.test",
      city: "Chicago",
    });
    const gold = state.reservations.find((row) => row.rewardId === "gold-bar");
    assert.equal(gold?.lockedUsd, 1_000);
    assert.equal(gold?.status, "funded");
    assert.equal(availableBalanceUsd(state.ledger, state.reservations), 0);
    assert.equal(creditAlreadyGrantedForReferral(state.ledger, state.referrals[0].id), true);
  });

  it("requests trip credit only with destination, dates, and a full balance", () => {
    const missing = requestRedemption(seedRewardsState(), {
      memberId,
      rewardId: "trip-credit",
    });
    assert.equal(missing.ok, false);
    const ok = requestRedemption(seedRewardsState(), {
      memberId,
      rewardId: "trip-credit",
      destination: "Lisbon",
      startDate: "2026-11-10",
      endDate: "2026-11-14",
    });
    assert.equal(ok.ok, true);
    if (!ok.ok) return;
    assert.equal(ok.redemption.status, "requested");
    assert.equal(availableBalanceUsd(ok.state.ledger, ok.state.reservations), 0);
  });

  it("keeps Founders Circle locked until three credits", () => {
    const attempt = requestRedemption(seedRewardsState(), { memberId, rewardId: "founders-circle" });
    assert.equal(attempt.ok, false);
  });
});
