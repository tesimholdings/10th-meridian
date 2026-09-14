import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LIFETIME_AMOUNT_USD,
  LIFETIME_PRICE_LABEL,
  membershipProducts,
  resolveCheckoutProduct,
} from "@/lib/config/pricing";

describe("approved Lifetime pricing", () => {
  it("publishes Lifetime at $10,000 one-time and organization by application", () => {
    assert.equal(LIFETIME_AMOUNT_USD, 10_000);
    assert.equal(LIFETIME_PRICE_LABEL, "$10,000");
    assert.equal(membershipProducts.lifetime.cadence, "one-time");
    assert.equal(membershipProducts.lifetime.checkoutEligible, true);
    assert.match(membershipProducts.lifetime.priceLabel, /10,000|\$10,000/);
    assert.equal(membershipProducts.organization.priceLabel, "By application");
    assert.equal(membershipProducts.organization.checkoutEligible, false);
    assert.equal("founding" in membershipProducts, false);
    assert.equal("standard" in membershipProducts, false);
  });

  it("aliases founding and standard checkout posts to Lifetime", () => {
    assert.equal(resolveCheckoutProduct("lifetime"), "lifetime");
    assert.equal(resolveCheckoutProduct("founding"), "lifetime");
    assert.equal(resolveCheckoutProduct("standard"), "lifetime");
    assert.equal(resolveCheckoutProduct("organization"), "organization");
    assert.equal(resolveCheckoutProduct("monthly"), null);
  });
});
