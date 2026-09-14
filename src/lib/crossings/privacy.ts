import type { AppRole } from "@/lib/data/types";
import type { ProfileRecord } from "@/lib/data/types";
import type {
  JourneyRecord,
  JourneyVisibility,
  MembershipStanding,
} from "@/lib/crossings/types";
import { effectiveJourneyStatus } from "@/lib/crossings/dates";
import { blocked } from "@/lib/matching/score";
import type { BlockRecord } from "@/lib/matching/types";

const FLIGHT_RE = /\b(?:flight|flt)\s*[A-Z]{1,3}\s?\d{1,4}\b|\b[A-Z]{2}\s?\d{3,4}\b/i;
const ROOM_RE = /\b(?:room|rm|suite|ste\.?)\s*#?\s*\d{1,5}[A-Z]?\b/i;
const GPS_RE = /\b-?\d{1,3}\.\d{3,},\s*-?\d{1,3}\.\d{3,}\b/;
const ITINERARY_RE = /\b(?:confirmation|pnr|booking\s*ref|gate\s*\d+|terminal\s*[A-Z0-9]+)\b/i;

export const FORBIDDEN_TRAVEL_DETAIL =
  "City-level presence only. Flight numbers, hotel names for your stay, room numbers, live location, and detailed itineraries are not collected.";

export function findForbiddenTravelDetail(text: string | undefined): string | null {
  if (!text) return null;
  if (FLIGHT_RE.test(text)) return "Flight numbers are not collected.";
  if (ROOM_RE.test(text)) return "Room numbers are not collected.";
  if (GPS_RE.test(text)) return "Exact coordinates are not collected.";
  if (ITINERARY_RE.test(text)) return "Detailed itineraries are not collected.";
  return null;
}

export function assertSafeTravelText(text: string | undefined) {
  const hit = findForbiddenTravelDetail(text);
  if (hit) {
    const err = new Error(hit);
    (err as Error & { code: string }).code = "forbidden_travel_detail";
    throw err;
  }
}

export function canMutateCrossings(role: AppRole | null | undefined): boolean {
  return role === "member" || role === "moderator" || role === "administrator";
}

export function standingOf(
  profileId: string,
  standings: Record<string, MembershipStanding> | undefined,
): MembershipStanding {
  return standings?.[profileId] ?? "active";
}

export function isMemberEligibleForTravel(
  profile: ProfileRecord,
  options: {
    viewerId: string;
    blocks?: BlockRecord[];
    standings?: Record<string, MembershipStanding>;
  },
): boolean {
  if (profile.id === options.viewerId) return false;
  if (profile.visibility === "hidden") return false;
  if (profile.availability === "paused") return false;
  const standing = standingOf(profile.id, options.standings);
  if (standing === "expired" || standing === "suspended") return false;
  if (blocked(options.viewerId, profile.id, options.blocks ?? [])) return false;
  return true;
}

export function canViewerSeeJourney(input: {
  journey: JourneyRecord;
  viewerId: string;
  viewerRole: AppRole | null | undefined;
  isMeridianMatch: boolean;
  sharedChannelIds: string[];
  now?: Date;
}): boolean {
  const { journey } = input;
  if (journey.status === "deleted") return false;
  if (effectiveJourneyStatus(journey, input.now) === "expired") {
    return journey.profileId === input.viewerId || input.viewerRole === "administrator";
  }
  if (journey.profileId === input.viewerId) return true;
  if (input.viewerRole === "administrator" || input.viewerRole === "moderator") return true;
  if (journey.status === "paused") return false;

  const vis: JourneyVisibility = journey.visibility;
  if (vis === "administrators") return false;
  if (vis === "meridian_matches") return input.isMeridianMatch;
  if (vis === "selected_channels") {
    return journey.selectedChannelIds.some((id) => input.sharedChannelIds.includes(id));
  }
  return true;
}

export function venueVisibleTo(input: {
  tableOpenedBy: string;
  confirmedIds: string[];
  viewerId: string;
  viewerRole: AppRole | null | undefined;
}): boolean {
  if (input.viewerRole === "administrator") return true;
  if (input.viewerId === input.tableOpenedBy) return true;
  return input.confirmedIds.includes(input.viewerId);
}

export function openHouseMaySeeRealTravel(isMemberAccess: boolean): boolean {
  return isMemberAccess;
}
