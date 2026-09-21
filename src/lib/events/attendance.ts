import type { AppRole, ProfileRecord } from "@/lib/data/types";

/** Preview and live registrations. Position is the waitlist order, not a separate person. */
export type EventRegistration = {
  eventId: string;
  accountId: string;
  status: "registered" | "waitlist";
};

export type Face = {
  id: string;
  accountId: string;
  name: string;
  initials: string;
  accent: string;
  position?: number;
};

export type EventRoster = {
  going: Face[];
  waitlist: Face[];
};

type FaceSource = Pick<ProfileRecord, "id" | "accountId" | "displayName" | "initials" | "accent">;

/** Existing members only. Unknown account ids are skipped — never invented. */
export function faceFromProfile(profile: FaceSource, position?: number): Face {
  return {
    id: profile.id,
    accountId: profile.accountId,
    name: profile.displayName,
    initials: profile.initials,
    accent: profile.accent,
    position,
  };
}

export function rosterForEvent(
  eventId: string,
  profiles: readonly FaceSource[],
  regs: readonly EventRegistration[],
  attendingIds?: ReadonlyMap<string, readonly string[]>,
): EventRoster {
  const byAccount = new Map(profiles.map((profile) => [profile.accountId, profile]));
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  const going: Face[] = [];
  const waitlist: Face[] = [];
  const seen = new Set<string>();

  let position = 0;
  for (const reg of regs) {
    if (reg.eventId !== eventId) continue;
    const profile = byAccount.get(reg.accountId) ?? byId.get(reg.accountId);
    if (!profile || seen.has(profile.id)) continue;
    seen.add(profile.id);
    if (reg.status === "waitlist") {
      position += 1;
      waitlist.push(faceFromProfile(profile, position));
    } else {
      going.push(faceFromProfile(profile));
    }
  }

  if (attendingIds) {
    for (const profile of profiles) {
      const ids = attendingIds.get(profile.id) ?? [];
      if (!ids.includes(eventId) || seen.has(profile.id)) continue;
      seen.add(profile.id);
      going.push(faceFromProfile(profile));
    }
  }

  return { going, waitlist };
}

export function syncRegistrationCounts(
  eventId: string,
  regs: readonly EventRegistration[],
): { registered: number; waitlist: number } {
  let registered = 0;
  let waitlist = 0;
  for (const reg of regs) {
    if (reg.eventId !== eventId) continue;
    if (reg.status === "waitlist") waitlist += 1;
    else registered += 1;
  }
  return { registered, waitlist };
}

/**
 * Host override: a waitlisted member becomes registered even when the listing
 * is already at capacity. Counts are derived from the registration list.
 */
export function applyPromotion(
  regs: readonly EventRegistration[],
  eventId: string,
  accountId: string,
): { ok: true; regs: EventRegistration[] } | { ok: false; message: string } {
  const index = regs.findIndex((reg) => reg.eventId === eventId && reg.accountId === accountId);
  if (index < 0) return { ok: false, message: "That person is not on this list." };
  const current = regs[index];
  if (!current || current.status !== "waitlist") {
    return { ok: false, message: "That person is already attending." };
  }
  const next = regs.map((reg, i) => (i === index ? { ...reg, status: "registered" as const } : reg));
  return { ok: true, regs: next };
}

/** Steward (moderator), administrator, or the member who hosts the listing. */
export function canPromoteAttendance(input: {
  role: AppRole | null | undefined;
  viewerId: string | null | undefined;
  hostProfileId?: string | null;
}): boolean {
  if (input.role === "administrator" || input.role === "moderator") return true;
  return Boolean(input.hostProfileId && input.viewerId && input.hostProfileId === input.viewerId);
}

const SALON_WAITLIST = ["demo-02", "demo-10", "demo-11"] as const;

/** Seed registrations from members already marked attending, plus a real waitlist. */
export function seedAttendance(
  profiles: readonly FaceSource[],
  events: { id: string; registered: number; waitlist: number }[],
  attendingIds: ReadonlyMap<string, readonly string[]>,
): EventRegistration[] {
  const regs: EventRegistration[] = [];
  const knownEvents = new Set(events.map((event) => event.id));

  for (const profile of profiles) {
    for (const eventId of attendingIds.get(profile.id) ?? []) {
      if (!knownEvents.has(eventId)) continue;
      regs.push({ eventId, accountId: profile.accountId, status: "registered" });
    }
  }

  const salon = "evt-demo-2";
  if (knownEvents.has(salon)) {
    for (const id of SALON_WAITLIST) {
      const profile = profiles.find((person) => person.id === id);
      if (!profile) continue;
      if (regs.some((reg) => reg.eventId === salon && reg.accountId === profile.accountId)) continue;
      regs.push({ eventId: salon, accountId: profile.accountId, status: "waitlist" });
    }
  }

  for (const event of events) {
    const counts = syncRegistrationCounts(event.id, regs);
    event.registered = counts.registered;
    event.waitlist = counts.waitlist;
  }

  return regs;
}

export function journeyCompanions(
  city: string,
  journeys: readonly { profileId: string; destinationCity: string; status: string }[],
  profiles: readonly FaceSource[],
): Face[] {
  const needle = city.trim().toLowerCase();
  if (!needle) return [];
  const ids: string[] = [];
  for (const journey of journeys) {
    if (journey.status === "deleted") continue;
    if (journey.destinationCity.trim().toLowerCase() !== needle) continue;
    if (!ids.includes(journey.profileId)) ids.push(journey.profileId);
  }
  const faces: Face[] = [];
  for (const id of ids) {
    const profile = profiles.find((person) => person.id === id);
    if (profile) faces.push(faceFromProfile(profile));
  }
  return faces;
}
