import { FLEXIBLE_WINDOW_DAYS } from "@/lib/crossings/types";
import type { JourneyRecord } from "@/lib/crossings/types";
import { zonedParts } from "@/lib/access/open-house";

/**
 * Civil date `YYYY-MM-DD` interpreted in `timeZone`, returned as UTC instants
 * for the start of that day and the start of the following day.
 */
export function zonedDayRange(
  isoDate: string,
  timeZone: string,
): { start: Date; end: Date } {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Dates must be YYYY-MM-DD.");
  }
  const start = zonedInstant(year, month, day, 0, 0, timeZone);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const end = zonedInstant(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    0,
    0,
    timeZone,
  );
  return { start, end };
}

function zonedInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const asUtcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const probed = zonedParts(new Date(asUtcGuess), timeZone);
  const probedUtc = Date.UTC(
    probed.year,
    probed.month - 1,
    probed.day,
    probed.hour,
    probed.minute,
    probed.second,
  );
  return new Date(asUtcGuess + (asUtcGuess - probedUtc));
}

export function shiftIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return utc.toISOString().slice(0, 10);
}

export function journeyWindow(journey: Pick<
  JourneyRecord,
  "arrivalDate" | "departureDate" | "timezone" | "flexibleDates"
>): { start: Date; end: Date } {
  const pad = journey.flexibleDates ? FLEXIBLE_WINDOW_DAYS : 0;
  const arrival = shiftIsoDate(journey.arrivalDate, -pad);
  const departure = shiftIsoDate(journey.departureDate, pad);
  const start = zonedDayRange(arrival, journey.timezone).start;
  const end = zonedDayRange(departure, journey.timezone).end;
  return { start, end };
}

export function dateRangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

export function journeysOverlap(
  a: Pick<JourneyRecord, "arrivalDate" | "departureDate" | "timezone" | "flexibleDates">,
  b: Pick<JourneyRecord, "arrivalDate" | "departureDate" | "timezone" | "flexibleDates">,
): boolean {
  const wa = journeyWindow(a);
  const wb = journeyWindow(b);
  return dateRangesOverlap(wa.start, wa.end, wb.start, wb.end);
}

export function overlapRatio(
  a: Pick<JourneyRecord, "arrivalDate" | "departureDate" | "timezone" | "flexibleDates">,
  b: Pick<JourneyRecord, "arrivalDate" | "departureDate" | "timezone" | "flexibleDates">,
): number {
  const wa = journeyWindow(a);
  const wb = journeyWindow(b);
  const start = Math.max(wa.start.getTime(), wb.start.getTime());
  const end = Math.min(wa.end.getTime(), wb.end.getTime());
  if (end <= start) return 0;
  const overlap = end - start;
  const shorter = Math.min(wa.end.getTime() - wa.start.getTime(), wb.end.getTime() - wb.start.getTime());
  if (shorter <= 0) return 0;
  return Math.min(1, overlap / shorter);
}

export function sameCity(
  aCity: string,
  aCountry: string,
  bCity: string,
  bCountry: string,
): boolean {
  return (
    normPlace(aCity) === normPlace(bCity) &&
    normPlace(aCountry) === normPlace(bCountry)
  );
}

export function normPlace(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Travel visibility expires at the end of the departure civil day in the
 * journey timezone. Historical Crossings remain; the journey itself is expired.
 */
export function isJourneyExpired(
  journey: Pick<JourneyRecord, "departureDate" | "timezone" | "status">,
  now: Date = new Date(),
): boolean {
  if (journey.status === "expired" || journey.status === "deleted") return true;
  const { end } = zonedDayRange(journey.departureDate, journey.timezone);
  return now.getTime() >= end.getTime();
}

export function effectiveJourneyStatus(
  journey: JourneyRecord,
  now: Date = new Date(),
): JourneyRecord["status"] {
  if (journey.status === "deleted" || journey.status === "paused") return journey.status;
  if (isJourneyExpired(journey, now)) return "expired";
  return "active";
}

export function isJourneyVisibleForMatching(
  journey: JourneyRecord,
  now: Date = new Date(),
): boolean {
  return effectiveJourneyStatus(journey, now) === "active";
}

export function formatCity(city: string, country: string): string {
  return `${city}, ${country}`;
}
