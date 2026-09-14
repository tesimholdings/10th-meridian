import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateOpenHouse, zonedParts } from "@/lib/access/open-house";

const tz = "America/Chicago";

function chicago(isoLocal: string): Date {
  // Interpret the wall time in America/Chicago by probing offsets.
  const [date, time] = isoLocal.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh + 5, mm, 0));
  const parts = zonedParts(guess, tz);
  const targetMinutes = hh * 60 + mm;
  const gotMinutes = parts.hour * 60 + parts.minute;
  return new Date(guess.getTime() + (targetMinutes - gotMinutes) * 60_000);
}

describe("Open House server clock", () => {
  it("locks members of the public outside the tenth", () => {
    const now = chicago("2026-09-09T12:00");
    const d = evaluateOpenHouse({
      now,
      role: "guest",
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    assert.equal(d.allowed, false);
    assert.equal(d.phase, "locked");
  });

  it("lets approved-unpaid members in on any day for checkout", () => {
    const now = chicago("2026-09-09T12:00");
    const d = evaluateOpenHouse({
      now,
      role: "approved_unpaid",
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    assert.equal(d.allowed, true);
    assert.equal(d.phase, "always_member");
  });

  it("lets members in on any day", () => {
    const now = chicago("2026-09-09T12:00");
    const d = evaluateOpenHouse({
      now,
      role: "member",
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    assert.equal(d.allowed, true);
    assert.equal(d.phase, "always_member");
    assert.equal(d.isDemo, false);
  });

  it("requires a referral between 9 and 10 on the tenth", () => {
    const now = chicago("2026-09-10T09:15");
    const closed = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: false,
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    const early = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: true,
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    assert.equal(closed.allowed, false);
    assert.equal(closed.phase, "referral_early");
    assert.equal(early.allowed, true);
  });

  it("opens to general visitors at 10 and closes at 22", () => {
    const open = evaluateOpenHouse({
      now: chicago("2026-09-10T10:05"),
      role: "guest",
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    const late = evaluateOpenHouse({
      now: chicago("2026-09-10T22:01"),
      role: "guest",
      config: { timeZone: tz, force: "auto", day: 10 },
    });
    assert.equal(open.allowed, true);
    assert.equal(open.phase, "open_house");
    assert.equal(open.isDemo, true);
    assert.equal(late.allowed, false);
  });
});
