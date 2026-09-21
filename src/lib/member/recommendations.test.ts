import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommendationsToRender } from "@/lib/member/recommendations";

describe("circle recommendations", () => {
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  it("renders 10 when the dial is 10, not the wider field of 100", () => {
    const shown = recommendationsToRender(rows, 10);
    assert.equal(shown.length, 10);
    assert.deepEqual(shown, rows.slice(0, 10));
  });

  it("renders the dial value up to the available rows", () => {
    assert.equal(recommendationsToRender(rows, 100).length, 100);
    assert.equal(recommendationsToRender(rows.slice(0, 12), 40).length, 12);
    assert.equal(recommendationsToRender(rows, 0).length, 0);
  });
});
