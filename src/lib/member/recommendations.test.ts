import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { recommendationsToRender } from "@/lib/member/recommendations";

describe("circle recommendations", () => {
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  it("defaults to the 10 most relevant people", () => {
    const shown = recommendationsToRender(rows);
    assert.equal(shown.length, 10);
    assert.deepEqual(shown, rows.slice(0, 10));
  });

  it("never renders past the rows that exist", () => {
    assert.equal(recommendationsToRender(rows, 100).length, 100);
    assert.equal(recommendationsToRender(rows.slice(0, 12), 40).length, 12);
    assert.equal(recommendationsToRender(rows, 0).length, 0);
  });

  it("does not mount a circle-size slider", () => {
    const field = readFileSync("src/components/circle/for-you-field.tsx", "utf8");
    assert.equal(field.includes("type=\"range\""), false);
    assert.equal(field.includes("meridian-range"), false);
    assert.equal(field.includes("meridian-dial"), false);
    assert.match(field, /recommendationsToRender\(rows, CURATED\)|recommendationsToRender\(rows, 10\)|CURATED = 10/);
  });
});