import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ErrorEvent } from "@sentry/core";
import { scrubSentryEvent } from "@/lib/sentry/capture";

describe("sentry event scrubbing", () => {
  it("keeps a user id and drops other identity plus request bodies", () => {
    const event = scrubSentryEvent({
      type: undefined,
      user: { id: "member-1", email: "hidden@example.com", username: "hidden" },
      request: {
        data: { fullName: "Applicant", email: "a@b.c" },
        cookies: { session: "secret" },
      },
    } as unknown as ErrorEvent);
    assert.deepEqual(event.user, { id: "member-1" });
    assert.equal(event.request?.data, undefined);
    assert.equal(event.request?.cookies, undefined);
  });
});
