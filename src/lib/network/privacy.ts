import type { EventRecord, ProfileRecord } from "@/lib/data/types";
import { DEFAULT_PROFILE_PRIVACY, type ProfilePrivacy } from "@/lib/network/types";

export function privacyOf(profile: ProfileRecord): ProfilePrivacy {
  return { ...DEFAULT_PROFILE_PRIVACY, ...profile.privacy };
}

/** Redact optional fields the subject has hidden. Never invent missing data. */
export function presentProfile(
  profile: ProfileRecord,
  opts: { viewerId: string; isOpenHouseGuest?: boolean },
): ProfileRecord {
  const self = profile.id === opts.viewerId;
  if (self) return profile;
  const privacy = privacyOf(profile);
  return {
    ...profile,
    website: privacy.website ? profile.website : undefined,
    linkedin: privacy.linkedin ? profile.linkedin : undefined,
    socials: privacy.socials
      ? (profile.socials ?? []).filter((row) => {
          if (row.provider === "website") return privacy.website;
          if (row.provider === "linkedin") return privacy.linkedin;
          return true;
        })
      : [],
    gallery: privacy.gallery ? profile.gallery : [],
    offers: privacy.offers ? profile.offers : [],
    needs: privacy.needs ? profile.needs : [],
    strengths: privacy.strengths ? profile.strengths : [],
    attendingEventIds: privacy.events ? profile.attendingEventIds : [],
  };
}

export function visibleEvents(
  events: EventRecord[],
  attendingIds: string[] | undefined,
  now = new Date(),
): EventRecord[] {
  const ids = new Set(attendingIds ?? []);
  return events
    .filter((e) => ids.has(e.id) && new Date(e.startsAt).getTime() >= now.getTime())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function isOptionalFieldVisible(privacy: ProfilePrivacy, field: keyof ProfilePrivacy): boolean {
  return privacy[field];
}
