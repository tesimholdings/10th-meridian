import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { destinationTimeToIso } from "./local-time";
describe("table destination wall time", () => {
  it("uses London time independent of the device timezone", () =>
    assert.equal(
      destinationTimeToIso("2026-10-14T19:30", "Europe/London"),
      "2026-10-14T18:30:00.000Z",
    ));
  it("supports fractional-hour offsets", () =>
    assert.equal(
      destinationTimeToIso("2026-10-14T19:30", "Asia/Kolkata"),
      "2026-10-14T14:00:00.000Z",
    ));
  it("rejects a nonexistent spring-forward time", () =>
    assert.throws(
      () => destinationTimeToIso("2026-03-29T01:30", "Europe/London"),
      /skipped/,
    ));
  it("rejects an ambiguous fall-back time", () =>
    assert.throws(
      () => destinationTimeToIso("2026-10-25T01:30", "Europe/London"),
      /twice/,
    ));
});
