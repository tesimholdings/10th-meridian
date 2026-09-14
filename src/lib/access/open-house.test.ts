import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateOpenHouse, zonedParts } from "@/lib/access/open-house";
import { resolveVisitorTimeZone } from "@/lib/access/timezone";

function atZone(isoLocal: string, timeZone: string): Date {
  const [date, time] = isoLocal.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  const parts = zonedParts(guess, timeZone);
  const targetMinutes = hh * 60 + mm;
  const gotMinutes = parts.hour * 60 + parts.minute;
  const dayDelta =
    parts.year === y && parts.month === m && parts.day === d
      ? 0
      : parts.day > d || parts.month > m || parts.year > y
        ? 1
        : -1;
  return new Date(guess.getTime() + (targetMinutes - gotMinutes - dayDelta * 24 * 60) * 60_000);
}

describe("Open House visitor-local clock", () => {
  it("locks the public outside the tenth in the visitor timezone", () => {
    const now = atZone("2026-09-09T12:00", "America/Chicago");
    const d = evaluateOpenHouse({
      now,
      role: "guest",
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    assert.equal(d.allowed, false);
    assert.equal(d.phase, "locked");
    assert.equal(d.config.timeZone, "America/Chicago");
  });

  it("lets members in on any day", () => {
    const now = atZone("2026-09-09T12:00", "America/Chicago");
    const d = evaluateOpenHouse({
      now,
      role: "member",
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    assert.equal(d.allowed, true);
    assert.equal(d.phase, "always_member");
  });

  it("requires a referral between 9 and 10 local on the tenth", () => {
    const now = atZone("2026-09-10T09:15", "America/Chicago");
    const closed = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: false,
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    const early = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: true,
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    assert.equal(closed.allowed, false);
    assert.equal(closed.phase, "referral_early");
    assert.equal(early.allowed, true);
  });

  it("opens to general visitors at 10 and closes at 22 local", () => {
    const open = evaluateOpenHouse({
      now: atZone("2026-09-10T10:05", "America/Chicago"),
      role: "guest",
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    const late = evaluateOpenHouse({
      now: atZone("2026-09-10T22:01", "America/Chicago"),
      role: "guest",
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    assert.equal(open.allowed, true);
    assert.equal(open.phase, "open_house");
    assert.equal(late.allowed, false);
  });

  it("evaluates Tokyo independently of Chicago", () => {
    const tokyoMorning = atZone("2026-09-10T10:05", "Asia/Tokyo");
    const tokyo = evaluateOpenHouse({
      now: tokyoMorning,
      role: "guest",
      visitorTimeZone: "Asia/Tokyo",
      config: { force: "auto", day: 10 },
    });
    const chicagoSameInstant = evaluateOpenHouse({
      now: tokyoMorning,
      role: "guest",
      visitorTimeZone: "America/Chicago",
      config: { force: "auto", day: 10 },
    });
    assert.equal(tokyo.allowed, true);
    assert.equal(tokyo.phase, "open_house");
    assert.equal(tokyo.config.timeZone, "Asia/Tokyo");
    assert.equal(chicagoSameInstant.allowed, false);
  });

  it("closes Tokyo at 22:01 local while Chicago may still be open", () => {
    const tokyoClose = atZone("2026-09-10T22:01", "Asia/Tokyo");
    const tokyo = evaluateOpenHouse({
      now: tokyoClose,
      role: "guest",
      visitorTimeZone: "Asia/Tokyo",
      config: { force: "auto", day: 10 },
    });
    assert.equal(tokyo.allowed, false);
    assert.equal(tokyo.phase, "locked");
  });

  it("honors a London referral hour at 09:15 local", () => {
    const now = atZone("2026-09-10T09:15", "Europe/London");
    const closed = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: false,
      visitorTimeZone: "Europe/London",
      config: { force: "auto", day: 10 },
    });
    const early = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: true,
      visitorTimeZone: "Europe/London",
      config: { force: "auto", day: 10 },
    });
    assert.equal(closed.phase, "referral_early");
    assert.equal(closed.allowed, false);
    assert.equal(early.allowed, true);
    assert.equal(early.config.timeZone, "Europe/London");
  });

  it("falls back to America/Chicago for an invalid IANA zone", () => {
    assert.equal(resolveVisitorTimeZone("Not/AZone"), "America/Chicago");
    assert.equal(resolveVisitorTimeZone(""), "America/Chicago");
    const d = evaluateOpenHouse({
      now: atZone("2026-09-10T10:05", "America/Chicago"),
      role: "guest",
      visitorTimeZone: "Not/AZone",
      config: { force: "auto", day: 10 },
    });
    assert.equal(d.config.timeZone, "America/Chicago");
    assert.equal(d.allowed, true);
  });
});
