import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { computeMatchIndex } from "@/lib/matching/service";
import { validateReferralCode } from "@/lib/referrals/validate";
import {
  createReferral,
  getPreviewStore,
  recordFeedback,
  resetPreviewStore,
  revokeReferral,
  setApplicationStatus,
  setCuration,
  setWeights,
} from "@/lib/preview/store";

describe("preview store", () => {
  beforeEach(() => {
    resetPreviewStore();
  });

  it("applies weight edits to subsequent Index scores", async () => {
    const store = getPreviewStore();
    const before = store.weights.complementary;
    setWeights({ ...store.weights, complementary: 0.8, goals: 0.05 });
    const after = getPreviewStore().weights;
    assert.notEqual(after.complementary, before);
    assert.ok(after.complementary > after.goals);
    const index = await computeMatchIndex({
      viewer: store.profiles[0],
      members: store.profiles,
      weights: after,
      useSemantic: false,
    });
    assert.equal(index.weights.complementary, after.complementary);
  });

  it("does not reappear declined people after store feedback", async () => {
    const store = getPreviewStore();
    const viewer = store.profiles[0];
    const target = store.profiles[1];
    recordFeedback({ viewerId: viewer.id, targetId: target.id, signal: "declined" });
    const index = await computeMatchIndex({
      viewer,
      members: store.profiles,
      feedback: getPreviewStore().feedback,
      useSemantic: false,
    });
    assert.equal(
      index.meridian100.find((m) => m.target.id === target.id),
      undefined,
    );
  });

  it("labels curated promotions from the store", async () => {
    const store = getPreviewStore();
    setCuration({
      viewerId: store.viewerId,
      targetId: "demo-05",
      action: "promote",
      reason: "Steward: film language meets a stated cultural need.",
    });
    const index = await computeMatchIndex({
      viewer: store.profiles[0],
      members: store.profiles,
      curation: getPreviewStore().curation,
      useSemantic: false,
    });
    const row = index.meridian100.find((m) => m.target.id === "demo-05");
    assert.equal(row?.source, "human_curated");
  });

  it("blocks approval at the monthly cap unless override is logged", () => {
    const store = getPreviewStore();
    store.admissionsCap = 1;
    const [first, second] = store.applications;
    const ok = setApplicationStatus({
      id: first.id,
      status: "approved_payment_pending",
    });
    assert.equal(ok.ok, true);
    const blocked = setApplicationStatus({
      id: second.id,
      status: "approved_payment_pending",
      override: false,
    });
    assert.equal(blocked.ok, false);
    const forced = setApplicationStatus({
      id: second.id,
      status: "approved_payment_pending",
      override: true,
    });
    assert.equal(forced.ok, true);
  });

  it("revoked referrals fail the same as unknown codes", () => {
    const created = createReferral({ code: "TENTH-HOST", label: "test", maxUses: 3 });
    assert.equal(created.ok, true);
    revokeReferral(created.referral!.id);
    assert.deepEqual(validateReferralCode("TENTH-HOST"), { ok: false });
    assert.deepEqual(validateReferralCode("NOPE"), { ok: false });
  });
});
