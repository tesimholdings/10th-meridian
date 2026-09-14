import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAsk } from "@/lib/matching/ask/parse";

describe("Ask the Meridian parse", () => {
  it("parses a Series A fintech NYC ask into structured facets", () => {
    const parsed = parseAsk({
      query: "I need an intro to Series A fintech investors in NYC",
    });
    assert.equal(parsed.empty, false);
    assert.ok(parsed.intents.includes("intro"));
    assert.ok(parsed.intents.includes("capital"));
    assert.ok(parsed.industries.includes("fintech"));
    assert.ok(parsed.geography.includes("New York"));
    assert.ok(parsed.needs.some((n) => /series a|investor|fintech/i.test(n)));
  });

  it("treats a blank query with no chips or filters as empty", () => {
    const parsed = parseAsk({ query: "   " });
    assert.equal(parsed.empty, true);
    assert.deepEqual(parsed.intents, []);
    assert.deepEqual(parsed.needs, []);
  });

  it("builds a structured ask from an intent chip alone", () => {
    const parsed = parseAsk({ query: "", intents: ["capital"] });
    assert.equal(parsed.empty, false);
    assert.ok(parsed.intents.includes("capital"));
    assert.ok(parsed.needs.length > 0);
  });
});
