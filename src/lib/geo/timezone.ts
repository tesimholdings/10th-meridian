/** City / country → IANA timezone. Never silently invents Europe/Paris. */

export interface PlaceTimezone {
  city: string;
  country: string;
  timezone: string;
  aliases: string[];
}

export const KNOWN_PLACES: PlaceTimezone[] = [
  { city: "Chicago", country: "United States", timezone: "America/Chicago", aliases: ["usa", "us", "illinois"] },
  { city: "New York", country: "United States", timezone: "America/New_York", aliases: ["nyc", "usa", "us"] },
  { city: "Austin", country: "United States", timezone: "America/Chicago", aliases: ["texas", "usa", "us"] },
  { city: "Denver", country: "United States", timezone: "America/Denver", aliases: ["usa", "us"] },
  { city: "Los Angeles", country: "United States", timezone: "America/Los_Angeles", aliases: ["la", "usa", "us"] },
  { city: "San Francisco", country: "United States", timezone: "America/Los_Angeles", aliases: ["sf", "usa", "us"] },
  { city: "Paris", country: "France", timezone: "Europe/Paris", aliases: ["france"] },
  { city: "London", country: "United Kingdom", timezone: "Europe/London", aliases: ["uk", "england", "britain"] },
  { city: "Edinburgh", country: "United Kingdom", timezone: "Europe/London", aliases: ["scotland", "uk"] },
  { city: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", aliases: ["nigeria"] },
  { city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", aliases: ["cdmx", "mexico"] },
  { city: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", aliases: ["sweden"] },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", aliases: [] },
  { city: "Mumbai", country: "India", timezone: "Asia/Kolkata", aliases: ["bombay", "india"] },
  { city: "Kyoto", country: "Japan", timezone: "Asia/Tokyo", aliases: ["japan"] },
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", aliases: ["japan"] },
  { city: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", aliases: ["portugal"] },
];

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isValidTimeZone(tz: string): boolean {
  if (!tz.trim()) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz.trim() });
    return true;
  } catch {
    return false;
  }
}

export function inferTimezone(city: string, country: string): string | null {
  const c = norm(city);
  const k = norm(country);
  if (!c) return null;

  const exact = KNOWN_PLACES.filter((p) => norm(p.city) === c);
  if (exact.length === 1 && (!k || norm(exact[0].country) === k || exact[0].aliases.includes(k))) {
    return exact[0].timezone;
  }
  if (exact.length > 1) {
    const byCountry = exact.find((p) => norm(p.country) === k || p.aliases.includes(k));
    return byCountry?.timezone ?? null;
  }

  const fuzzy = KNOWN_PLACES.filter(
    (p) =>
      norm(p.city).includes(c) ||
      c.includes(norm(p.city)) ||
      p.aliases.includes(c),
  );
  if (fuzzy.length === 1 && (!k || norm(fuzzy[0].country) === k || fuzzy[0].aliases.includes(k))) {
    return fuzzy[0].timezone;
  }
  if (k) {
    const countryHits = KNOWN_PLACES.filter(
      (p) =>
        (norm(p.city) === c || p.aliases.includes(c)) &&
        (norm(p.country) === k || p.aliases.includes(k)),
    );
    if (countryHits.length === 1) return countryHits[0].timezone;
  }
  return null;
}

export function resolveJourneyTimezone(input: {
  city: string;
  country: string;
  timezone: string;
}): { ok: true; timezone: string } | { ok: false; message: string } {
  const inferred = inferTimezone(input.city, input.country);
  const typed = input.timezone.trim();
  if (inferred) {
    if (typed && typed !== inferred && isValidTimeZone(typed)) {
      return { ok: true, timezone: typed };
    }
    return { ok: true, timezone: inferred };
  }
  if (typed && isValidTimeZone(typed)) {
    return { ok: true, timezone: typed };
  }
  return {
    ok: false,
    message:
      "Choose a valid IANA timezone for this destination — it is not inferred silently.",
  };
}
