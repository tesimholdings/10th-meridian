import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatEventWhen, isEventTonight, wallClockFromIso } from "@/lib/events/when";

describe("event when", () => {
  it("keeps destination wall-clock time instead of converting to UTC", () => {
    const salon = "2026-11-08T19:00:00-06:00";
    const wall = wallClockFromIso(salon);
    assert.equal(wall?.d, 8);
    assert.equal(wall?.hh, 19);
    const label = formatEventWhen(salon, "Undisclosed");
    assert.match(label, /November 8, 2026/);
    assert.match(label, /7:00 PM/);
    assert.doesNotMatch(label, /1:00 AM/);
  });

  it("labels Tonight only on the same local day", () => {
    const event = { startsAt: "2026-10-10T17:00:00-05:00", city: "Chicago" };
    assert.equal(isEventTonight(event, new Date("2026-10-10T20:00:00-05:00")), true);
    assert.equal(isEventTonight(event, new Date("2026-09-15T12:00:00-05:00")), false);
  });
});
