import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canChargeLifetime,
  formatFromAddress,
  hasPosthog,
  hasResend,
  hasSentryDsn,
  hasStripe,
  hasStripePrice,
  integrationStatus,
} from "@/lib/env";

describe("live-stack env helpers", () => {
  it("formats EMAIL_FROM as a branded mailbox", () => {
    assert.equal(
      formatFromAddress("team@tenmeridian.com"),
      "10th Meridian <team@tenmeridian.com>",
    );
    assert.equal(
      formatFromAddress("10th Meridian <team@tenmeridian.com>"),
      "10th Meridian <team@tenmeridian.com>",
    );
    assert.equal(formatFromAddress(""), "10th Meridian <team@tenmeridian.com>");
  });

  it("treats missing keys as demo-safe", () => {
    assert.equal(hasResend(), Boolean(process.env.RESEND_API_KEY?.trim()));
    assert.equal(hasStripe(), Boolean(process.env.STRIPE_SECRET_KEY?.trim()));
    assert.equal(hasPosthog(), Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()));
    assert.equal(
      hasSentryDsn(),
      Boolean((process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN)?.trim()),
    );
    assert.equal(canChargeLifetime(), hasStripe() && hasStripePrice());
    const status = integrationStatus();
    assert.equal(status.canCharge, canChargeLifetime());
    assert.ok("posthog" in status && "sentry" in status);
  });
});
