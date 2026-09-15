import type { ProfileRecord } from "@/lib/data/types";
import { KNOWN_PLACES } from "@/lib/geo/timezone";

export type AskMatchKind = "exact" | "partial";

export interface AskHit {
  profileId: string;
  displayName: string;
  headline: string;
  city: string;
  country: string;
  reason: string;
  score: number;
  kind: AskMatchKind;
}

export interface AskResult {
  hits: AskHit[];
  exactCount: number;
  queriedPlace: string | null;
  queriedTopics: string[];
  emptyReason: string | null;
}

const STOP = new Set([
  "who",
  "can",
  "help",
  "with",
  "the",
  "and",
  "for",
  "you",
  "your",
  "a",
  "an",
  "i",
  "me",
  "my",
  "to",
  "of",
  "in",
  "on",
  "at",
  "or",
  "is",
  "are",
  "someone",
  "anyone",
  "looking",
  "need",
  "needs",
  "please",
  "find",
  "show",
  "people",
  "person",
  "that",
  "this",
  "next",
  "should",
  "know",
  "ask",
  "meridian",
  "house",
  "want",
  "would",
  "like",
  "about",
  "from",
  "into",
]);

const PLACE_INDEX = KNOWN_PLACES.flatMap((p) => {
  const names = [p.city, p.country, ...p.aliases].map((n) => n.toLowerCase());
  return names.map((name) => ({ name, city: p.city, country: p.country }));
});

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function interpretAskQuery(query: string): {
  places: { city: string; country: string }[];
  topics: string[];
  rawTokens: string[];
} {
  const rawTokens = tokens(query);
  const places: { city: string; country: string }[] = [];
  const used = new Set<string>();

  for (const token of rawTokens) {
    const hit = PLACE_INDEX.find((p) => p.name === token || p.name.replace(/\s+/g, "") === token);
    if (hit && !places.some((p) => p.city === hit.city)) {
      places.push({ city: hit.city, country: hit.country });
      used.add(token);
    }
  }

  // Multi-word places ("new york", "mexico city")
  const blob = rawTokens.join(" ");
  for (const place of KNOWN_PLACES) {
    const city = place.city.toLowerCase();
    if (city.includes(" ") && blob.includes(city) && !places.some((p) => p.city === place.city)) {
      places.push({ city: place.city, country: place.country });
      city.split(" ").forEach((part) => used.add(part));
    }
  }

  const topics = rawTokens.filter((t) => !used.has(t));
  return { places, topics, rawTokens };
}

function norm(value: string): string {
  return value.toLowerCase();
}

function fieldHas(values: string[], topic: string): string | undefined {
  return values.find((v) => norm(v).includes(topic) || topic.includes(norm(v).split(" ")[0] ?? ""));
}

function locationRelation(
  profile: ProfileRecord,
  place: { city: string; country: string },
): "city" | "country" | "geography" | "travel" | "none" {
  if (norm(profile.city) === norm(place.city)) return "city";
  if (profile.geography.some((g) => norm(g) === norm(place.city))) return "geography";
  if (profile.travel.some((t) => norm(t).includes(norm(place.city)))) return "travel";
  return "none";
}

function topicHit(profile: ProfileRecord, topic: string): { field: string; value: string } | null {
  const offer = fieldHas(profile.offers, topic);
  if (offer) return { field: "offers", value: offer };
  const strength = fieldHas(profile.strengths, topic);
  if (strength) return { field: "strengths", value: strength };
  const need = fieldHas(profile.needs, topic);
  if (need) return { field: "needs", value: need };
  const goal = fieldHas([...profile.goals, ...profile.ambitions], topic);
  if (goal) return { field: "goals", value: goal };
  const industry = fieldHas(profile.industries, topic);
  if (industry) return { field: "industry", value: industry };
  const interest = fieldHas([...profile.interests, ...profile.causes], topic);
  if (interest) return { field: "interests", value: interest };
  if (norm(profile.headline).includes(topic) || norm(profile.bio).includes(topic) || norm(profile.roleTitle).includes(topic)) {
    return { field: "profile", value: topic };
  }
  return null;
}

function buildReason(input: {
  profile: ProfileRecord;
  place?: { city: string; country: string };
  loc: ReturnType<typeof locationRelation> | "none";
  topics: { field: string; value: string }[];
  kind: AskMatchKind;
}): string {
  const cityLine = `${input.profile.city}`;
  const topic = input.topics[0];
  const topicLine = topic
    ? topic.field === "offers"
      ? `can help with ${topic.value}`
      : topic.field === "needs"
        ? `looking for ${topic.value}`
        : topic.field === "strengths"
          ? topic.value
          : topic.value
    : null;

  if (input.place && input.loc === "city") {
    return topicLine ? `In ${input.place.city} · ${topicLine}` : `Based in ${input.place.city}`;
  }
  if (input.place && input.loc === "travel") {
    return topicLine
      ? `${topicLine} · based in ${cityLine} · travels to ${input.place.city}`
      : `Based in ${cityLine} · travels to ${input.place.city}`;
  }
  if (input.place && input.loc === "geography") {
    return topicLine
      ? `${topicLine} · based in ${cityLine} · also works around ${input.place.city}`
      : `Based in ${cityLine} · also around ${input.place.city}`;
  }
  if (input.place && input.loc === "none") {
    return topicLine
      ? `${topicLine} · based in ${cityLine}, not ${input.place.city}`
      : `Based in ${cityLine}, not ${input.place.city}`;
  }
  return topicLine ? `${topicLine} · ${cityLine}` : cityLine;
}

/** Lightweight NL help-finding for Ask the Meridian. Never invents people. Honest location. */
export function askTheMeridian(
  query: string,
  profiles: ProfileRecord[],
  viewerId: string,
): AskHit[] {
  return askTheMeridianDetailed(query, profiles, viewerId).hits;
}

export function askTheMeridianDetailed(
  query: string,
  profiles: ProfileRecord[],
  viewerId: string,
): AskResult {
  const interpreted = interpretAskQuery(query);
  if (interpreted.rawTokens.length === 0 && interpreted.places.length === 0) {
    return {
      hits: [],
      exactCount: 0,
      queriedPlace: null,
      queriedTopics: [],
      emptyReason: "Ask with a place or a kind of help — filler words are ignored.",
    };
  }

  const place = interpreted.places[0];
  const hits: AskHit[] = [];

  for (const profile of profiles) {
    if (profile.id === viewerId) continue;

    const loc = place ? locationRelation(profile, place) : "none";
    const topicHits = interpreted.topics
      .map((t) => topicHit(profile, t))
      .filter((t): t is { field: string; value: string } => Boolean(t));

    const hasPlace = Boolean(place) && loc !== "none";
    const hasTopic = topicHits.length > 0;
    if (!hasPlace && !hasTopic) continue;

    const exactPlace = loc === "city";
    const exactTopic = topicHits.some((t) => t.field === "offers" || t.field === "strengths");
    const kind: AskMatchKind =
      (place ? exactPlace : true) && (interpreted.topics.length ? exactTopic || hasTopic : true) && (place ? exactPlace : hasTopic)
        ? place
          ? exactPlace && (interpreted.topics.length === 0 || hasTopic)
            ? "exact"
            : "partial"
          : "exact"
        : "partial";

    let score = 0;
    if (exactPlace) score += 8;
    else if (loc === "geography") score += 4;
    else if (loc === "travel") score += 3;
    else if (loc === "none" && place) score += 0;
    for (const t of topicHits) {
      if (t.field === "offers") score += 5;
      else if (t.field === "strengths") score += 4;
      else if (t.field === "needs" || t.field === "goals") score += 3;
      else score += 2;
    }
    if (place && loc === "none") score -= 3;

    hits.push({
      profileId: profile.id,
      displayName: profile.displayName,
      headline: profile.headline,
      city: profile.city,
      country: profile.country,
      reason: buildReason({ profile, place, loc, topics: topicHits, kind }),
      score,
      kind,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.displayName.localeCompare(b.displayName));
  const exact = hits.filter((h) => h.kind === "exact");
  const partial = hits.filter((h) => h.kind === "partial");
  const ranked = [...exact, ...partial].slice(0, 8);
  const queriedPlace = place?.city ?? null;

  let emptyReason: string | null = null;
  if (ranked.length === 0) {
    emptyReason = queriedPlace
      ? `No one in this frame matches ${queriedPlace}. The house does not invent members.`
      : "No one in this frame. The house does not invent members.";
  }

  return {
    hits: ranked,
    exactCount: exact.length,
    queriedPlace,
    queriedTopics: interpreted.topics,
    emptyReason,
  };
}
