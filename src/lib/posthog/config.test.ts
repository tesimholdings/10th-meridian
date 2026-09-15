import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { posthogPublicConfig } from "@/lib/posthog/config";

describe("PostHog config", () => {
  it("is a no-op when NEXT_PUBLIC_POSTHOG_KEY is missing", () => {
    const previous = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const config = posthogPublicConfig();
    assert.equal(config.enabled, false);
    assert.equal(config.key, null);
    assert.ok(config.host.includes("posthog.com"));
    if (previous === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    else process.env.NEXT_PUBLIC_POSTHOG_KEY = previous;
  });
});
