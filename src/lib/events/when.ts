import { formatHumanDateTime } from "@/lib/crossings/format";
import { inferTimezone } from "@/lib/geo/timezone";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Wall-clock from an offset ISO string, so UTC viewers do not see 1:00 AM for 7:00 PM -06:00. */
export function wallClockFromIso(iso: string): {
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  offset: string;
} | null {
  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})?/,
  );
  if (!match) return null;
  return {
    y: Number(match[1]),
    m: Number(match[2]),
    d: Number(match[3]),
    hh: Number(match[4]),
    mm: Number(match[5]),
    offset: match[7] === "Z" ? "+00:00" : (match[7] ?? ""),
  };
}

function hourLabel(hh: number, mm: number): string {
  const suffix = hh >= 12 ? "PM" : "AM";
  const hour = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour}:${String(mm).padStart(2, "0")} ${suffix}`;
}

function zoneLabel(iso: string, city?: string): string | undefined {
  const tz = city ? inferTimezone(city, "") : null;
  if (tz) {
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
        .formatToParts(new Date(iso))
        .find((p) => p.type === "timeZoneName")?.value;
    } catch {
      return tz;
    }
  }
  const wall = wallClockFromIso(iso);
  if (wall?.offset) return `GMT${wall.offset === "+00:00" ? "" : wall.offset}`;
  return undefined;
}

export function eventTimeZone(city?: string | null): string | undefined {
  if (!city?.trim()) return undefined;
  return inferTimezone(city, "") ?? undefined;
}

export function formatEventWhen(iso: string, city?: string | null): string {
  const wall = wallClockFromIso(iso);
  const zone = zoneLabel(iso, city ?? undefined);
  if (wall) {
    const date = `${MONTHS[wall.m - 1]} ${wall.d}, ${wall.y}`;
    const time = hourLabel(wall.hh, wall.mm);
    return zone ? `${date} at ${time} ${zone}` : `${date} at ${time}`;
  }
  return formatHumanDateTime(iso, eventTimeZone(city));
}

export function isSameCalendarDay(iso: string, now = new Date(), timeZone?: string): boolean {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timeZone && timeZone.length > 0 ? timeZone : undefined,
  };
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", opts);
    return fmt.format(new Date(iso)) === fmt.format(now);
  } catch {
    return false;
  }
}

export function isEventTonight(
  event: { startsAt: string; city?: string | null },
  now = new Date(),
): boolean {
  return isSameCalendarDay(event.startsAt, now, eventTimeZone(event.city));
}
