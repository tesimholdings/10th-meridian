import type { TravelMatchKind, TravelScoredMatch } from "@/lib/crossings/types";

export const PRESENCE_KIND_LABELS: Record<TravelMatchKind, string> = {
  local: "Local",
  fellow_traveler: "Fellow traveler",
  city_host: "City Host",
  meridian: "My Circle",
};

export const PRESENCE_COUNT_LABELS = [
  { kind: "local" as const, label: "Locals" },
  { kind: "fellow_traveler" as const, label: "Travelers" },
  { kind: "city_host" as const, label: "City Hosts" },
  { kind: "meridian" as const, label: "My Circle" },
];

export function summarizeCityPresence(matches: Pick<TravelScoredMatch, "kind">[]) {
  const counts: Record<TravelMatchKind, number> = {
    local: 0,
    fellow_traveler: 0,
    city_host: 0,
    meridian: 0,
  };
  for (const row of matches) {
    counts[row.kind] += 1;
  }
  return {
    total: matches.length,
    ...counts,
  };
}

export function presenceLine(kind: TravelMatchKind, homeCity?: string | null): string {
  const city = homeCity?.trim();
  if (kind === "fellow_traveler") return "Also traveling here";
  if (kind === "city_host") return city ? `City Host in ${city}` : "City Host here";
  if (kind === "meridian") return city ? `My Circle · ${city}` : "My Circle";
  return city ? `Lives in ${city}` : "Lives in this city";
}
