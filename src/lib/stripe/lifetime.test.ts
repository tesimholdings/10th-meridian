import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LIFETIME_PRICE_AMOUNT, LIFETIME_PRICE_LABEL } from "@/lib/copy/community";
import {
  checkoutStubMessage,
  createLifetimeCheckoutSession,
  LIFETIME_CHECKOUT_MODE,
  lifetimeChargeReady,
} from "@/lib/stripe/lifetime";

describe("Stripe lifetime checkout", () => {
  it("never charges without keys and documents the $10,000 lifetime price", () => {
    assert.equal(LIFETIME_PRICE_LABEL, "$10,000");
    assert.equal(LIFETIME_PRICE_AMOUNT, 10_000);
    assert.equal(LIFETIME_CHECKOUT_MODE, "payment");
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      assert.equal(lifetimeChargeReady(), false);
    }
  });

  it("returns a stub result instead of inventing a session", async () => {
    const result = await createLifetimeCheckoutSession({
      accountId: "preview-member",
      email: "approved@preview.10thmeridian.test",
      successUrl: "http://localhost:3000/member/billing?checkout=success",
      cancelUrl: "http://localhost:3000/member/billing?checkout=cancel",
    });
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.stub, true);
        assert.equal(result.reason, "missing-keys");
        assert.match(checkoutStubMessage(result.reason), /Nothing is charged|No amount is invented/);
      }
    }
  });
});
