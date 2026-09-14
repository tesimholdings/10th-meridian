import type { ProfileRecord } from "@/lib/data/types";
import {
  clamp01,
  complementaryScore,
  explanationsFor,
  scorePair,
  weigh,
} from "@/lib/matching/score";
import type { BlockRecord, MatchingWeights } from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";
import type { MatchIndex } from "@/lib/matching/service";
import {
  formatCity,
  isJourneyVisibleForMatching,
  journeysOverlap,
  normPlace,
  overlapRatio,
  sameCity,
} from "@/lib/crossings/dates";
import { isMemberEligibleForTravel } from "@/lib/crossings/privacy";
import type {
  CityHostRecord,
  JourneyRecord,
  MembershipStanding,
  MeetingFormat,
  TravelIntent,
  TravelMatchKind,
  TravelMatchWeights,
  TravelScoredMatch,
} from "@/lib/crossings/types";
import { DEFAULT_TRAVEL_WEIGHTS } from "@/lib/crossings/types";

export function normalizeTravelWeights(weights: TravelMatchWeights): TravelMatchWeights {
  const sum =
    weights.meridian +
    weights.overlap +
    weights.intent +
    weights.complementary +
    weights.availability;
  if (sum <= 0) return DEFAULT_TRAVEL_WEIGHTS;
  return {
    meridian: weights.meridian / sum,
    overlap: weights.overlap / sum,
    intent: weights.intent / sum,
    complementary: weights.complementary / sum,
    availability: weights.availability / sum,
  };
}

function intentScore(a: TravelIntent[], b: TravelIntent[]): number {
  if (a.includes("open") || b.includes("open")) return 0.72;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function availabilityScore(a: MeetingFormat[], b: MeetingFormat[]): number {
  if (a.includes("open") || b.includes("open")) return 0.7;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  if (A.size === 0 || B.size === 0) return 0.35;
  return Math.min(1, inter / Math.max(1, Math.min(A.size, B.size)));
}

function kindFor(input: {
  target: ProfileRecord;
  journey: JourneyRecord;
  targetJourney?: JourneyRecord;
  host?: CityHostRecord;
  inMeridian100: boolean;
}): TravelMatchKind {
  if (input.host) return "city_host";
  if (
    input.targetJourney &&
    journeysOverlap(input.journey, input.targetJourney) &&
    sameCity(
      input.journey.destinationCity,
      input.journey.destinationCountry,
      input.targetJourney.destinationCity,
      input.targetJourney.destinationCountry,
    )
  ) {
    return "fellow_traveler";
  }
  if (isLocalInDestination(input.target, input.journey)) return "local";
  if (input.inMeridian100) return "meridian";
  return "local";
}

export function isLocalInDestination(profile: ProfileRecord, journey: JourneyRecord): boolean {
  return (
    normPlace(profile.city) === normPlace(journey.destinationCity) &&
    (normPlace(profile.country) === normPlace(journey.destinationCountry) ||
      profile.geography.some((g) => normPlace(g) === normPlace(journey.destinationCity)))
  );
}

function whyYouShouldMeet(row: {
  kind: TravelMatchKind;
  target: ProfileRecord;
  journey: JourneyRecord;
  explanations: { pillar: string; text: string }[];
  inMeridian10: boolean;
}): string {
  const city = formatCity(row.journey.destinationCity, row.journey.destinationCountry);
  if (row.kind === "city_host") {
    return `${row.target.displayName} is a City Host in ${city} — a member welcome, not a concierge.`;
  }
  if (row.kind === "fellow_traveler") {
    return `Your dates overlap in ${city}. ${row.explanations[0]?.text ?? "A quiet compatibility on the road."}`;
  }
  if (row.inMeridian10) {
    return `Already on your Meridian 10, and in ${city} while you are.`;
  }
  if (row.kind === "local") {
    return `A member in ${city}. ${row.explanations[0]?.text ?? "Presence is city-level only."}`;
  }
  return row.explanations[0]?.text ?? `Your paths may cross in ${city}.`;
}

export interface TravelMatchInput {
  viewer: ProfileRecord;
  viewerJourney: JourneyRecord;
  members: ProfileRecord[];
  journeys: JourneyRecord[];
  hosts: CityHostRecord[];
  meridian?: MatchIndex;
  blocks?: BlockRecord[];
  standings?: Record<string, MembershipStanding>;
  indexWeights?: MatchingWeights;
  travelWeights?: TravelMatchWeights;
  now?: Date;
}

export function scoreTravelMatches(input: TravelMatchInput): TravelScoredMatch[] {
  const weights = normalizeTravelWeights(input.travelWeights ?? DEFAULT_TRAVEL_WEIGHTS);
  const now = input.now ?? new Date();
  const journey = input.viewerJourney;
  const meridian10 = new Set((input.meridian?.meridian10 ?? []).map((m) => m.target.id));
  const meridian100 = new Set((input.meridian?.meridian100 ?? []).map((m) => m.target.id));
  const meridianScoreById = new Map(
    (input.meridian?.meridian100 ?? []).map((m) => [m.target.id, m.weighted]),
  );

  const eligible = input.members.filter((m) =>
    isMemberEligibleForTravel(m, {
      viewerId: input.viewer.id,
      blocks: input.blocks,
      standings: input.standings,
    }),
  );

  const out: TravelScoredMatch[] = [];

  for (const target of eligible) {
    const targetJourneys = input.journeys.filter(
      (j) =>
        j.profileId === target.id &&
        isJourneyVisibleForMatching(j, now) &&
        sameCity(j.destinationCity, j.destinationCountry, journey.destinationCity, journey.destinationCountry) &&
        journeysOverlap(journey, j),
    );
    const host = input.hosts.find(
      (h) =>
        h.profileId === target.id &&
        sameCity(h.city, h.country, journey.destinationCity, journey.destinationCountry),
    );
    const local = isLocalInDestination(target, journey);
    const overlapping = targetJourneys[0];
    const in100 = meridian100.has(target.id);
    const in10 = meridian10.has(target.id);

    if (!local && !overlapping && !host && !in100) continue;

    const pair = scorePair(input.viewer, target, { weights: input.indexWeights ?? DEFAULT_WEIGHTS });
    const meridianCompat =
      meridianScoreById.get(target.id) ?? weigh(pair, input.indexWeights ?? DEFAULT_WEIGHTS);
    const overlap = overlapping
      ? 0.55 + overlapRatio(journey, overlapping) * 0.45
      : local || host
        ? 0.8
        : 0.15;
    const intents = overlapping?.intents ?? (host ? (["open"] as TravelIntent[]) : journey.intents);
    const avail = overlapping?.availability ?? host?.meetingTypes ?? [];
    const intent = intentScore(journey.intents, intents);
    const availScore = availabilityScore(journey.availability, avail.length ? avail : journey.availability);
    const comp = complementaryScore(input.viewer, target).score;

    const weighted = clamp01(
      meridianCompat * weights.meridian +
        overlap * weights.overlap +
        intent * weights.intent +
        comp * weights.complementary +
        availScore * weights.availability,
    );

    const kind = kindFor({
      target,
      journey,
      targetJourney: overlapping,
      host,
      inMeridian100: in100,
    });
    const explanations = explanationsFor(input.viewer, target, pair);
    if (kind === "fellow_traveler") {
      explanations.unshift({
        pillar: "Dates",
        text: `Overlapping presence in ${formatCity(journey.destinationCity, journey.destinationCountry)}. City-level only.`,
      });
    }
    if (kind === "city_host") {
      explanations.unshift({
        pillar: "City Hosts",
        text: `${target.displayName} opted in to welcome visitors in ${journey.destinationCity}. Not a concierge.`,
      });
    }
    if (in10) {
      explanations.unshift({
        pillar: "Meridian 10",
        text: "Already among the ten people chosen for where you are — and where you are going.",
      });
    }

    out.push({
      viewerId: input.viewer.id,
      viewerJourneyId: journey.id,
      target,
      targetJourneyId: overlapping?.id,
      kind,
      weighted,
      meridianScore: meridianCompat,
      overlapScore: overlap,
      intentScore: intent,
      complementaryScore: comp,
      availabilityScore: availScore,
      explanations: explanations.slice(0, 3),
      why: whyYouShouldMeet({
        kind,
        target,
        journey,
        explanations,
        inMeridian10: in10,
      }),
      inMeridian10: in10,
      inMeridian100: in100,
    });
  }

  out.sort((a, b) => b.weighted - a.weighted);
  return out;
}

export function overlappingMembersInCity(input: {
  city: string;
  country: string;
  journeys: JourneyRecord[];
  members: ProfileRecord[];
  viewerId: string;
  blocks?: BlockRecord[];
  standings?: Record<string, MembershipStanding>;
}): ProfileRecord[] {
  const relevant = input.journeys.filter(
    (j) =>
      j.status === "active" &&
      sameCity(j.destinationCity, j.destinationCountry, input.city, input.country),
  );
  const ids = new Set(relevant.map((j) => j.profileId));
  return input.members.filter(
    (m) =>
      ids.has(m.id) &&
      isMemberEligibleForTravel(m, {
        viewerId: input.viewerId,
        blocks: input.blocks,
        standings: input.standings,
      }),
  );
}

export function suggestTables(input: {
  journeys: JourneyRecord[];
  members: ProfileRecord[];
  viewerId: string;
  blocks?: BlockRecord[];
  standings?: Record<string, MembershipStanding>;
}): { city: string; country: string; count: number; profileIds: string[] }[] {
  const groups = new Map<string, Set<string>>();
  for (const j of input.journeys) {
    if (j.status !== "active" || !j.openToGroupTable) continue;
    const key = `${normPlace(j.destinationCity)}|${normPlace(j.destinationCountry)}`;
    const peers = input.journeys.filter(
      (other) =>
        other.id !== j.id &&
        other.status === "active" &&
        other.openToGroupTable &&
        sameCity(
          j.destinationCity,
          j.destinationCountry,
          other.destinationCity,
          other.destinationCountry,
        ) &&
        journeysOverlap(j, other),
    );
    const set = groups.get(key) ?? new Set<string>();
    set.add(j.profileId);
    for (const p of peers) set.add(p.profileId);
    groups.set(key, set);
  }

  const suggestions: { city: string; country: string; count: number; profileIds: string[] }[] = [];
  for (const [key, ids] of groups) {
    const eligible = [...ids].filter((id) => {
      const profile = input.members.find((m) => m.id === id);
      if (!profile) return false;
      if (id === input.viewerId) return true;
      return isMemberEligibleForTravel(profile, {
        viewerId: input.viewerId,
        blocks: input.blocks,
        standings: input.standings,
      });
    });
    if (eligible.length < 3) continue;
    const [city, country] = key.split("|");
    const sample = input.journeys.find(
      (j) => normPlace(j.destinationCity) === city && normPlace(j.destinationCountry) === country,
    );
    suggestions.push({
      city: sample?.destinationCity ?? city,
      country: sample?.destinationCountry ?? country,
      count: eligible.length,
      profileIds: eligible,
    });
  }
  return suggestions;
}
