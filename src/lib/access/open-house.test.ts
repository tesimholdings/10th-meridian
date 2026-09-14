import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateOpenHouse,
  FALLBACK_TIMEZONE,
  getOpenHouseConfig,
  resolveVisitorTimeZone,
  zonedParts,
} from "@/lib/access/open-house";

const tz = "America/Chicago";

function wall(isoLocal: string, timeZone: string): Date {
  const [date, time] = isoLocal.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  const parts = zonedParts(guess, timeZone);
  const want = Date.UTC(y, m - 1, d, hh, mm, 0);
  const got = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  return new Date(guess.getTime() + (want - got));
}

function chicago(isoLocal: string): Date {
  return wall(isoLocal, tz);
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

describe("Open House visitor timezone", () => {
  it("accepts a valid IANA name and rejects invalid input", () => {
    assert.equal(resolveVisitorTimeZone("Asia/Tokyo"), "Asia/Tokyo");
    assert.equal(resolveVisitorTimeZone("America/New_York"), "America/New_York");
    assert.equal(resolveVisitorTimeZone("not-a-zone"), FALLBACK_TIMEZONE);
    assert.equal(resolveVisitorTimeZone(""), FALLBACK_TIMEZONE);
    assert.equal(resolveVisitorTimeZone("Etc/../../../passwd"), FALLBACK_TIMEZONE);
    assert.equal(getOpenHouseConfig({ timeZone: "Nope/City" }).timeZone, FALLBACK_TIMEZONE);
  });

  it("opens in Tokyo while the same UTC instant is still locked in Chicago", () => {
    // 10:05 on the 10th in Tokyo = 01:05 UTC = 20:05 the 9th in Chicago (CDT).
    const now = wall("2026-09-10T10:05", "Asia/Tokyo");
    const tokyo = evaluateOpenHouse({
      now,
      role: "guest",
      config: { timeZone: "Asia/Tokyo", force: "auto", day: 10 },
    });
    const chicagoAtSameInstant = evaluateOpenHouse({
      now,
      role: "guest",
      config: { timeZone: "America/Chicago", force: "auto", day: 10 },
    });
    assert.equal(tokyo.allowed, true);
    assert.equal(tokyo.phase, "open_house");
    assert.equal(tokyo.config.timeZone, "Asia/Tokyo");
    assert.equal(tokyo.now.hour, 10);
    assert.equal(chicagoAtSameInstant.allowed, false);
    assert.equal(chicagoAtSameInstant.phase, "locked");
  });

  it("honors referral early hour in the visitor's local timezone", () => {
    const now = wall("2026-09-10T09:15", "Asia/Tokyo");
    const closed = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: false,
      config: { timeZone: "Asia/Tokyo", force: "auto", day: 10 },
    });
    const early = evaluateOpenHouse({
      now,
      role: "guest",
      hasValidReferral: true,
      config: { timeZone: "Asia/Tokyo", force: "auto", day: 10 },
    });
    assert.equal(closed.allowed, false);
    assert.equal(closed.phase, "referral_early");
    assert.equal(early.allowed, true);
    assert.equal(early.phase, "referral_early");
  });
});
