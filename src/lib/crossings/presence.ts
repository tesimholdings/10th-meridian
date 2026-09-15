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

export function isPresentInCity(match: Pick<TravelScoredMatch, "kind">): boolean {
  return match.kind === "local" || match.kind === "fellow_traveler" || match.kind === "city_host";
}

export function summarizeCityPresence<
  T extends Pick<TravelScoredMatch, "kind" | "inMeridian10"> & { target?: { id: string } },
>(matches: T[], circleIds: readonly string[] = []) {
  const inCity = matches.filter(isPresentInCity);
  const circle = new Set(circleIds);
  const counts: Record<TravelMatchKind, number> = {
    local: 0,
    fellow_traveler: 0,
    city_host: 0,
    meridian: 0,
  };
  for (const row of inCity) {
    counts[row.kind] += 1;
    const inCircle = circle.size > 0 ? Boolean(row.target && circle.has(row.target.id)) : row.inMeridian10;
    if (inCircle) counts.meridian += 1;
  }
  return {
    total: inCity.length,
    inCity,
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
