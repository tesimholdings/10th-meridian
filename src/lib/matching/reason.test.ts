import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shortMatchReason } from "@/lib/matching/reason";
import type { ProfileRecord } from "@/lib/data/types";

const target = {
  city: "New York",
  offers: ["structured introductions"],
} as ProfileRecord;

describe("Index reason line", () => {
  it("keeps one short truthful reason plus city", () => {
    const reason = shortMatchReason(target, [
      { pillar: "Reciprocal value", text: "P. Adler can meet a need: structured introductions" },
    ]);
    assert.match(reason, /New York/);
    assert.match(reason, /introduction/i);
    assert.doesNotMatch(reason, /who, can/i);
  });
});
