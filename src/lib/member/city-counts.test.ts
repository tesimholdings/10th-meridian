import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cityCountLines } from "@/lib/member/city-counts";

describe("crossing city counts", () => {
  it("states the overlapping travelers and does not use a 100-person field as the city count", () => {
    const lines = cityCountLines({ city: "Paris", travelers: 3, locals: 0, hosts: 0 });
    assert.deepEqual(lines, ["3 members will be in Paris while you are."]);
    assert.equal(lines.join(" ").includes("100"), false);
  });

  it("keeps locals and hosts in their own sentences", () => {
    const lines = cityCountLines({ city: "Paris", travelers: 3, locals: 2, hosts: 1 });
    assert.equal(lines[0], "3 members will be in Paris while you are.");
    assert.equal(lines[1], "2 members live in Paris.");
    assert.equal(lines[2], "1 City Host can welcome you in Paris.");
  });
});
