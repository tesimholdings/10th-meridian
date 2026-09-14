import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zonedParts } from "@/lib/access/open-house";
import {
  dateRangesOverlap,
  isJourneyExpired,
  journeysOverlap,
  journeyWindow,
  shiftIsoDate,
  zonedDayRange,
} from "@/lib/crossings/dates";
import type { JourneyRecord } from "@/lib/crossings/types";

function j(
  partial: Partial<JourneyRecord> & Pick<JourneyRecord, "arrivalDate" | "departureDate" | "timezone">,
): Pick<JourneyRecord, "arrivalDate" | "departureDate" | "timezone" | "flexibleDates"> {
  return { flexibleDates: false, ...partial };
}

describe("Crossings dates and timezones", () => {
  it("treats overlapping civil dates as overlapping journeys", () => {
    const a = j({
      arrivalDate: "2026-10-12",
      departureDate: "2026-10-18",
      timezone: "Europe/Paris",
    });
    const b = j({
      arrivalDate: "2026-10-16",
      departureDate: "2026-10-22",
      timezone: "Europe/Paris",
    });
    assert.equal(journeysOverlap(a, b), true);
  });

  it("does not overlap adjacent non-inclusive windows", () => {
    const a = j({
      arrivalDate: "2026-10-01",
      departureDate: "2026-10-03",
      timezone: "America/Chicago",
    });
    const b = j({
      arrivalDate: "2026-10-04",
      departureDate: "2026-10-06",
      timezone: "America/Chicago",
    });
    assert.equal(journeysOverlap(a, b), false);
  });

  it("flexible dates expand the window by three days", () => {
    const a = j({
      arrivalDate: "2026-10-10",
      departureDate: "2026-10-10",
      timezone: "UTC",
      flexibleDates: true,
    });
    const b = j({
      arrivalDate: "2026-10-13",
      departureDate: "2026-10-13",
      timezone: "UTC",
    });
    assert.equal(journeysOverlap(a, b), true);
    const rigid = { ...a, flexibleDates: false };
    assert.equal(journeysOverlap(rigid, b), false);
  });

  it("timezone boundaries: Tokyo departure day still overlaps a Chicago morning", () => {
    const tokyo = j({
      arrivalDate: "2026-10-10",
      departureDate: "2026-10-10",
      timezone: "Asia/Tokyo",
    });
    const chicago = j({
      arrivalDate: "2026-10-10",
      departureDate: "2026-10-10",
      timezone: "America/Chicago",
    });
    assert.equal(journeysOverlap(tokyo, chicago), true);
    const tokyoWindow = journeyWindow(tokyo);
    const parts = zonedParts(new Date(tokyoWindow.end.getTime() - 60_000), "Asia/Tokyo");
    assert.equal(parts.day, 10);
  });

  it("a Tokyo-only 10th does not overlap a Chicago-only 12th", () => {
    const tokyo = j({
      arrivalDate: "2026-10-10",
      departureDate: "2026-10-10",
      timezone: "Asia/Tokyo",
    });
    const chicago = j({
      arrivalDate: "2026-10-12",
      departureDate: "2026-10-12",
      timezone: "America/Chicago",
    });
    assert.equal(journeysOverlap(tokyo, chicago), false);
  });

  it("expires visibility after the departure civil day in the journey timezone", () => {
    const journey = {
      departureDate: "2026-10-10",
      timezone: "Europe/Paris",
      status: "active" as const,
    };
    const { end } = zonedDayRange("2026-10-10", "Europe/Paris");
    assert.equal(isJourneyExpired(journey, new Date(end.getTime() - 1)), false);
    assert.equal(isJourneyExpired(journey, end), true);
  });

  it("dateRangesOverlap is half-open at the end", () => {
    const a0 = new Date("2026-10-01T00:00:00Z");
    const a1 = new Date("2026-10-03T00:00:00Z");
    const b0 = new Date("2026-10-03T00:00:00Z");
    const b1 = new Date("2026-10-05T00:00:00Z");
    assert.equal(dateRangesOverlap(a0, a1, b0, b1), false);
  });

  it("shiftIsoDate crosses month boundaries", () => {
    assert.equal(shiftIsoDate("2026-10-31", 2), "2026-11-02");
  });
});
