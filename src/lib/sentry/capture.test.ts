import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scrubSentryEvent } from "@/lib/sentry/capture";

describe("sentry event scrubbing", () => {
  it("keeps a user id and drops other identity plus request bodies", () => {
    const event = scrubSentryEvent({
      user: { id: "member-1", email: "hidden@example.com", username: "hidden" },
      request: { data: { fullName: "Applicant", email: "a@b.c" }, cookies: "secret" },
    });
    assert.deepEqual(event.user, { id: "member-1" });
    assert.equal(event.request.data, undefined);
    assert.equal(event.request.cookies, undefined);
  });
});
