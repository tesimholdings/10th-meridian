import { formatCity } from "@/lib/crossings/dates";
import { suggestTables } from "@/lib/crossings/matching";
import type {
  CrossingRequestRecord,
  JourneyRecord,
  TravelNotificationPref,
  TravelNotificationRecord,
} from "@/lib/crossings/types";
import type { ProfileRecord } from "@/lib/data/types";
import type { BlockRecord } from "@/lib/matching/types";
import type { MembershipStanding } from "@/lib/crossings/types";

export const DEFAULT_NOTIFICATION_PREFS: Omit<TravelNotificationPref, "profileId"> = {
  overlapDigest: true,
  goalRelevance: true,
  tableSuggestions: true,
  requestUpdates: true,
  digest: "weekly",
};

export function buildTravelNotifications(input: {
  viewer: ProfileRecord;
  journeys: JourneyRecord[];
  members: ProfileRecord[];
  requests: CrossingRequestRecord[];
  prefs: TravelNotificationPref;
  existing: TravelNotificationRecord[];
  blocks?: BlockRecord[];
  standings?: Record<string, MembershipStanding>;
  now?: Date;
}): TravelNotificationRecord[] {
  if (input.prefs.digest === "off") return [];
  const created: TravelNotificationRecord[] = [];
  const seen = new Set(input.existing.map((n) => n.dedupeKey));
  const stamp = (input.now ?? new Date()).toISOString();

  function push(kind: TravelNotificationRecord["kind"], title: string, body: string, dedupeKey: string) {
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    created.push({
      id: `tn-${kind}-${dedupeKey.slice(0, 24)}`,
      profileId: input.viewer.id,
      kind,
      title,
      body,
      dedupeKey,
      createdAt: stamp,
      isDemo: true,
    });
  }

  const viewerJourneys = input.journeys.filter(
    (j) => j.profileId === input.viewer.id && j.status === "active",
  );

  if (input.prefs.overlapDigest) {
    for (const journey of viewerJourneys) {
      const others = input.journeys.filter(
        (j) =>
          j.profileId !== input.viewer.id &&
          j.status === "active" &&
          j.destinationCity.toLowerCase() === journey.destinationCity.toLowerCase() &&
          j.destinationCountry.toLowerCase() === journey.destinationCountry.toLowerCase(),
      );
      const unique = new Set(others.map((j) => j.profileId));
      if (unique.size >= 3) {
        const city = journey.destinationCity;
        push(
          "overlap",
          `${unique.size} members will be in ${city} while you are.`,
          `City-level presence only in ${formatCity(city, journey.destinationCountry)}. SYNTHETIC DEMO.`,
          `overlap:${journey.id}:${unique.size}`,
        );
      }
    }
  }

  if (input.prefs.goalRelevance) {
    const relevant = input.members.find(
      (m) =>
        m.id !== input.viewer.id &&
        m.city === "New York" &&
        (m.goals.length > 0 || m.offers.length > 0),
    );
    const ny = input.members.find((m) => m.id !== input.viewer.id && m.city === "New York");
    const pick = relevant ?? ny;
    if (pick) {
      push(
        "goal",
        `A member in ${pick.city} may be especially relevant to your current goal.`,
        `${pick.displayName} · SYNTHETIC DEMO. Ranked by relevance, never by wealth or popularity.`,
        `goal:${input.viewer.id}:${pick.id}`,
      );
    }
  }

  if (input.prefs.tableSuggestions) {
    const tables = suggestTables({
      journeys: input.journeys,
      members: input.members,
      viewerId: input.viewer.id,
      blocks: input.blocks,
      standings: input.standings,
    });
    for (const t of tables) {
      if (t.count >= 4) {
        push(
          "table",
          `${numberWord(t.count)} paths cross in ${t.city}. Open a table?`,
          `A private group meal, neighborhood-level only until guests are confirmed. SYNTHETIC DEMO.`,
          `table:${t.city}:${t.country}:${t.count}`,
        );
      }
    }
  }

  if (input.prefs.requestUpdates) {
    for (const req of input.requests) {
      if (req.toProfileId === input.viewer.id && req.status === "proposed") {
        push(
          "request",
          "A Crossing request is waiting.",
          "Accept, decline, or suggest another time. SYNTHETIC DEMO.",
          `request:${req.id}:proposed`,
        );
      }
      if (req.fromProfileId === input.viewer.id && req.status === "accepted") {
        push(
          "request",
          "Your Crossing request was accepted.",
          "A private conversation may now open. SYNTHETIC DEMO.",
          `request:${req.id}:accepted`,
        );
      }
    }
  }

  return created;
}

function numberWord(n: number): string {
  const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  return words[n] ?? String(n);
}
