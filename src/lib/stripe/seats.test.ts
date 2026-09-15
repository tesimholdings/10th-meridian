import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  recordPaidMembership,
  resetPreviewStore,
  revokePaidMembership,
} from "@/lib/preview/store";
import { resolveMembershipOffer } from "@/lib/stripe/seats";
import { FOUNDING_TEN_CAP } from "@/lib/stripe/catalog";

describe("membership offer seats", () => {
  it("offers Founding Ten while fewer than 10 founding seats are taken", async () => {
    resetPreviewStore();
    const open = await resolveMembershipOffer({ accountId: "acct-new-1" });
    assert.equal(open.offer, "founding");
    assert.equal(open.reason, "founding-open");
    assert.equal(open.foundingRemaining, FOUNDING_TEN_CAP);
  });

  it("switches to Standard after Founding Ten is full", async () => {
    resetPreviewStore();
    for (let i = 0; i < FOUNDING_TEN_CAP; i += 1) {
      recordPaidMembership({
        accountId: `acct-founding-${i}`,
        email: `founding-${i}@preview.10thmeridian.test`,
        product: "founding",
        status: "active",
        eventId: `evt-founding-${i}`,
        source: "checkout",
      });
    }
    const full = await resolveMembershipOffer({ accountId: "acct-standard-new" });
    assert.equal(full.offer, "standard");
    assert.equal(full.reason, "founding-full");
    assert.equal(full.foundingRemaining, 0);
  });

  it("requires Standard rejoin after dues cancel, never a second Founding seat", async () => {
    resetPreviewStore();
    recordPaidMembership({
      accountId: "acct-rejoin-1",
      email: "rejoin@preview.10thmeridian.test",
      product: "standard",
      status: "active",
      eventId: "evt-join",
      source: "checkout",
      stripeSubscriptionId: "sub_rejoin_1",
    });
    revokePaidMembership({
      accountId: "acct-rejoin-1",
      eventId: "evt-cancel",
      stripeSubscriptionId: "sub_rejoin_1",
    });
    const rejoin = await resolveMembershipOffer({
      accountId: "acct-rejoin-1",
      email: "rejoin@preview.10thmeridian.test",
    });
    assert.equal(rejoin.offer, "standard");
    assert.equal(rejoin.reason, "rejoin");
  });

  it("does not start a second checkout while membership is active", async () => {
    resetPreviewStore();
    recordPaidMembership({
      accountId: "acct-active-1",
      product: "founding",
      status: "active",
      eventId: "evt-active",
      source: "checkout",
    });
    const active = await resolveMembershipOffer({ accountId: "acct-active-1" });
    assert.equal(active.reason, "already-active");
    assert.equal(active.offer, "founding");
  });
});
