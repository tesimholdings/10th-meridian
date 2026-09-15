import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ARCHIVED_LIFETIME_PRICE_ID,
  FOUNDING_ENTRY_CENTS,
  FOUNDING_TEN_CAP,
  MONTHLY_DUES_CENTS,
  STANDARD_ENTRY_CENTS,
  STRIPE_TEST_FOUNDING_PRICE_ID,
  STRIPE_TEST_MONTHLY_PRICE_ID,
  STRIPE_TEST_STANDARD_ENTRY_PRICE_ID,
  isApprovedFoundingPrice,
  isApprovedMonthlyPrice,
  isApprovedStandardEntryPrice,
  isArchivedLifetimePrice,
} from "@/lib/stripe/catalog";

describe("Stripe membership catalog", () => {
  it("documents Founding $5,000, Standard $10,000, and $195/month TEST prices", () => {
    assert.equal(FOUNDING_TEN_CAP, 10);
    assert.equal(FOUNDING_ENTRY_CENTS, 500_000);
    assert.equal(STANDARD_ENTRY_CENTS, 1_000_000);
    assert.equal(MONTHLY_DUES_CENTS, 19_500);
    assert.equal(STRIPE_TEST_FOUNDING_PRICE_ID, "price_1UG1eB3QQyESIKbfGysIcPYf");
    assert.equal(STRIPE_TEST_STANDARD_ENTRY_PRICE_ID, "price_1UG1eC3QQyESIKbfKbIfpHct");
    assert.equal(STRIPE_TEST_MONTHLY_PRICE_ID, "price_1UG1eD3QQyESIKbfZJOuoyS6");
    assert.equal(isArchivedLifetimePrice(ARCHIVED_LIFETIME_PRICE_ID), true);
  });

  it("accepts founding and standard one-time Prices and rejects the archived lifetime Price", () => {
    assert.equal(
      isApprovedFoundingPrice({
        id: STRIPE_TEST_FOUNDING_PRICE_ID,
        type: "one_time",
        unit_amount: FOUNDING_ENTRY_CENTS,
        currency: "usd",
        active: true,
      }).ok,
      true,
    );
    assert.equal(
      isApprovedStandardEntryPrice({
        id: STRIPE_TEST_STANDARD_ENTRY_PRICE_ID,
        type: "one_time",
        unit_amount: STANDARD_ENTRY_CENTS,
        currency: "usd",
        active: true,
      }).ok,
      true,
    );
    assert.equal(
      isApprovedFoundingPrice({
        id: ARCHIVED_LIFETIME_PRICE_ID,
        type: "one_time",
        unit_amount: STANDARD_ENTRY_CENTS,
        currency: "usd",
      }).ok,
      false,
    );
  });

  it("accepts $195/month recurring and rejects a monthly Price used as founding", () => {
    assert.equal(
      isApprovedMonthlyPrice({
        id: STRIPE_TEST_MONTHLY_PRICE_ID,
        type: "recurring",
        recurring: { interval: "month" },
        unit_amount: MONTHLY_DUES_CENTS,
        currency: "usd",
        active: true,
      }).ok,
      true,
    );
    assert.equal(
      isApprovedFoundingPrice({
        id: STRIPE_TEST_MONTHLY_PRICE_ID,
        type: "recurring",
        recurring: { interval: "month" },
        unit_amount: MONTHLY_DUES_CENTS,
        currency: "usd",
      }).ok,
      false,
    );
  });
});
