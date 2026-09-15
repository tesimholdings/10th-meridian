import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { askTheMeridianDetailed, interpretAskQuery } from "@/lib/ask/meridian";
import { demoProfiles } from "@/lib/data/demo";

const viewerId = "demo-01";

describe("Ask the Meridian explanations", () => {
  it("drops filler words from query interpretation", () => {
    const interpreted = interpretAskQuery("Who can help with Chicago introductions");
    assert.deepEqual(
      interpreted.places.map((p) => p.city),
      ["Chicago"],
    );
    assert.ok(interpreted.topics.includes("introductions"));
    assert.ok(!interpreted.rawTokens.includes("who"));
    assert.ok(!interpreted.rawTokens.includes("can"));
  });

  it("does not present Lagos or Paris as Chicago, and never uses filler reasons", () => {
    const result = askTheMeridianDetailed("Chicago introductions", demoProfiles, viewerId);
    assert.ok(result.queriedPlace === "Chicago");
    for (const hit of result.hits) {
      assert.equal(/signal on who|,\s*can,|who, can/i.test(hit.reason), false, hit.reason);
      assert.match(hit.reason, /Chicago|Lagos|New York|Paris|Austin|Denver|based in/i);
    }
    const first = result.hits[0];
    if (first) {
      assert.notEqual(first.city, "Paris", "Paris must not outrank a Chicago-relevant hit");
    }
    const lagos = result.hits.find((h) => h.city === "Lagos");
    if (lagos) {
      assert.equal(lagos.kind, "partial");
      assert.match(lagos.reason, /Lagos/i);
      assert.match(lagos.reason, /Chicago/i);
      assert.doesNotMatch(lagos.reason, /^In Chicago/i);
    }
  });

  it("surfaces an honest no-exact-match state when the place has no exact hit", () => {
    const result = askTheMeridianDetailed("Chicago introductions", demoProfiles, viewerId);
    const exactChicago = result.hits.filter((h) => h.kind === "exact" && h.city === "Chicago");
    if (exactChicago.length === 0) {
      assert.ok(result.exactCount === 0);
      assert.ok(result.hits.every((h) => h.kind === "partial" || h.city === "Chicago"));
    }
  });

  it("keeps location explicit for a place-only query", () => {
    const result = askTheMeridianDetailed("Chicago", demoProfiles, viewerId);
    assert.ok(result.hits.length > 0);
    for (const hit of result.hits) {
      assert.match(hit.reason.toLowerCase(), /chicago|based in/);
    }
  });
});
