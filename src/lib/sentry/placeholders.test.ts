import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sentryPlaceholderStatus, SENTRY_ENV } from "@/lib/sentry/placeholders";

describe("Sentry placeholders", () => {
  it("does not claim the SDK is wired on this branch", () => {
    const status = sentryPlaceholderStatus();
    assert.equal(status.wired, false);
    assert.match(status.note, /PR #12/);
    assert.equal(SENTRY_ENV.dsn, "SENTRY_DSN");
    assert.equal(SENTRY_ENV.publicDsn, "NEXT_PUBLIC_SENTRY_DSN");
  });
});
