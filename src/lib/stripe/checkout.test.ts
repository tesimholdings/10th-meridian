import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { resetPreviewStore } from "@/lib/preview/store";
import { checkoutStubMessage, createMembershipCheckoutSession } from "@/lib/stripe/checkout";
import { FOUNDING_ENTRY_LABEL, MONTHLY_DUES_LABEL, STANDARD_ENTRY_LABEL } from "@/lib/copy/community";
import { MEMBERSHIP_HEADLINE, MEMBERSHIP_NO_DISCOUNT, MEMBERSHIP_STANDARD } from "@/lib/copy/open-house";
import { canChargeMembership } from "@/lib/env";

describe("Stripe membership checkout", () => {
  it("documents Founding vs Standard copy and never charges without keys", () => {
    assert.equal(FOUNDING_ENTRY_LABEL, "$5,000");
    assert.equal(STANDARD_ENTRY_LABEL, "$10,000");
    assert.equal(MONTHLY_DUES_LABEL, "$195");
    assert.equal(MEMBERSHIP_HEADLINE, "Founding Ten. $5,000.");
    assert.match(MEMBERSHIP_STANDARD, /\$10,000/);
    assert.match(MEMBERSHIP_STANDARD, /\$195/);
    assert.match(MEMBERSHIP_NO_DISCOUNT, /No discounts/);
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      assert.equal(canChargeMembership(), false);
    }
    const checkoutSrc = readFileSync("src/lib/stripe/checkout.ts", "utf8");
    assert.match(checkoutSrc, /allow_promotion_codes: false/);
    assert.match(checkoutSrc, /mode: "payment"/);
    assert.match(checkoutSrc, /mode: "subscription"/);
    assert.equal(checkoutSrc.includes("price_1UG1Xg3QQyESIKbfV5BfJF6U"), false);
  });

  it("returns a stub result instead of inventing a session", async () => {
    resetPreviewStore();
    const result = await createMembershipCheckoutSession({
      accountId: "preview-approved_unpaid",
      email: "approved_unpaid@preview.10thmeridian.test",
      successUrl: "http://localhost:3000/member/billing?checkout=success",
      cancelUrl: "http://localhost:3000/member/billing?checkout=cancel",
    });
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.stub, true);
        assert.equal(result.reason, "missing-keys");
        assert.match(checkoutStubMessage(result.reason), /Nothing is charged|Nothing was charged/);
      }
    }
  });
});
