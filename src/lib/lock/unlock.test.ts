import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles, demoReferrals } from "@/lib/data/demo";
import {
  demoEmailFor,
  resolveLockUnlock,
  UNLOCK_MISS_MESSAGE,
} from "@/lib/lock/unlock";

describe("lock unlock resolver", () => {
  it("resolves founding members by name, username, and demo email", () => {
    for (const raw of [
      "Stefan Fulks",
      "stefan",
      "stefan-fulks",
      "stefan.fulks@preview.10thmeridian.test",
      "FULKS-10",
    ]) {
      const hit = resolveLockUnlock(raw);
      assert.equal(hit.kind, "member", raw);
      if (hit.kind === "member") {
        assert.equal(hit.profile.displayName, "Stefan Fulks");
        assert.equal(hit.email, demoEmailFor(hit.profile));
      }
    }

    const ricky = resolveLockUnlock("ricky");
    assert.equal(ricky.kind, "member");
    if (ricky.kind === "member") {
      assert.equal(ricky.profile.displayName, "Ricky Del Valle");
    }
  });

  it("resolves editorial demo identity without a password", () => {
    const voss = resolveLockUnlock("A. Voss");
    assert.equal(voss.kind, "member");
    if (voss.kind === "member") {
      assert.equal(voss.profile.id, "demo-01");
    }
    assert.equal(resolveLockUnlock("avoss").kind, "member");
    assert.equal(resolveLockUnlock("voss").kind, "member");
    assert.equal(resolveLockUnlock("VOSS-10").kind, "member");
  });

  it("accepts a live sample referral and hides expired or unknown codes", () => {
    const early = resolveLockUnlock("tenth-early");
    assert.equal(early.kind, "referral");
    if (early.kind === "referral") assert.equal(early.code, "TENTH-EARLY");

    assert.equal(resolveLockUnlock("TENTH-EXPIRED").kind, "miss");
    assert.equal(resolveLockUnlock("TENTH-REVOKED").kind, "miss");
    assert.equal(resolveLockUnlock("not-a-key").kind, "miss");
    assert.equal(resolveLockUnlock("").kind, "miss");
    assert.equal(UNLOCK_MISS_MESSAGE, "That cannot open the house.");
  });

  it("uses the supplied referral catalog", () => {
    const miss = resolveLockUnlock("TENTH-EARLY", { referrals: [] });
    assert.equal(miss.kind, "miss");
    const hit = resolveLockUnlock("TENTH-EARLY", { referrals: demoReferrals });
    assert.equal(hit.kind, "referral");
    assert.ok(demoProfiles.some((p) => p.displayName === "Stefan Fulks"));
  });
});
