import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Stripe from "stripe";
import { resetPreviewStore, membershipFor } from "@/lib/preview/store";
import {
  checkoutSessionShouldUnlock,
  invoiceOfferFromLines,
  resetStripeEventLog,
  revokeMembership,
  subscriptionIsRevoked,
  unlockMembership,
} from "@/lib/stripe/unlock";
import { handleStripeWebhook } from "@/lib/stripe/webhook";

describe("Stripe membership webhooks", () => {
  it("accepts unverified traffic as a stub and does not unlock", async () => {
    resetPreviewStore();
    resetStripeEventLog();
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const result = await handleStripeWebhook("{}", null);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.stub, true);
      assert.match(result.note, /not changed|not unlocked/i);
    }
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previous;
  });

  it("rejects missing signatures when a webhook secret is configured", async () => {
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_unit";
    const result = await handleStripeWebhook("{}", null);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
      assert.match(result.message, /signature/i);
    }
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previous;
  });

  it("verifies a signed event and unlocks founding membership idempotently", async () => {
    resetPreviewStore();
    resetStripeEventLog();
    const secret = "whsec_test_unit";
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({
      id: "evt_test_founding_1",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_founding_1",
          object: "checkout.session",
          mode: "payment",
          payment_status: "paid",
          customer_email: "founding@preview.10thmeridian.test",
          metadata: { accountId: "acct-founding-1", offer: "founding", product: "founding" },
          client_reference_id: "acct-founding-1",
        },
      },
    });
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    const first = await handleStripeWebhook(payload, signature);
    assert.equal(first.ok, true);
    if (first.ok && !first.stub) {
      assert.equal(first.unlocked, true);
    }
    const paid = membershipFor("acct-founding-1", "founding@preview.10thmeridian.test");
    assert.equal(paid?.product, "founding");
    assert.equal(paid?.status, "active");
    const second = await handleStripeWebhook(payload, signature);
    assert.equal(second.ok, true);
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previous;
  });
});

describe("membership unlock rules", () => {
  it("requires founding Checkout to be payment mode and standard to be subscription", () => {
    assert.equal(
      checkoutSessionShouldUnlock({
        mode: "payment",
        payment_status: "paid",
        status: "complete",
        metadata: { offer: "founding" },
      }).ok,
      true,
    );
    assert.equal(
      checkoutSessionShouldUnlock({
        mode: "subscription",
        payment_status: "paid",
        status: "complete",
        metadata: { offer: "founding" },
      }).ok,
      false,
    );
    assert.equal(
      checkoutSessionShouldUnlock({
        mode: "subscription",
        payment_status: "paid",
        status: "complete",
        metadata: { offer: "standard" },
      }).ok,
      true,
    );
  });

  it("revokes standard membership when the subscription is canceled", async () => {
    resetPreviewStore();
    resetStripeEventLog();
    await unlockMembership({
      eventId: "evt_grant",
      source: "checkout",
      product: "standard",
      accountId: "acct-std-1",
      email: "std@preview.10thmeridian.test",
      stripeSubscriptionId: "sub_test_1",
    });
    assert.equal(membershipFor("acct-std-1")?.status, "active");
    assert.equal(subscriptionIsRevoked("canceled"), true);
    await revokeMembership({
      eventId: "evt_revoke",
      accountId: "acct-std-1",
      stripeSubscriptionId: "sub_test_1",
    });
    assert.equal(membershipFor("acct-std-1")?.status, "canceled");
  });

  it("ignores unrelated invoices", () => {
    const ignored = invoiceOfferFromLines({
      metadata: {},
      lines: { data: [] },
    } as unknown as Stripe.Invoice);
    assert.equal("reason" in ignored, true);
  });

  it("revokes on customer.subscription.deleted", async () => {
    resetPreviewStore();
    resetStripeEventLog();
    await unlockMembership({
      eventId: "evt_std_grant",
      source: "checkout",
      product: "standard",
      accountId: "acct-del-1",
      email: "del@preview.10thmeridian.test",
      stripeSubscriptionId: "sub_del_1",
    });
    const secret = "whsec_test_unit";
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({
      id: "evt_test_sub_deleted",
      object: "event",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_del_1",
          object: "subscription",
          status: "canceled",
          metadata: { accountId: "acct-del-1" },
        },
      },
    });
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    const result = await handleStripeWebhook(payload, signature);
    assert.equal(result.ok, true);
    assert.equal(membershipFor("acct-del-1")?.status, "canceled");
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previous;
  });
});
