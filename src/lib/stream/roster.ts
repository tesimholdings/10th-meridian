import { demoProfiles, viewerDemoProfile } from "@/lib/data/demo";
import type { ProfileRecord } from "@/lib/data/types";

/** Server user that owns house channels. Not a member, so it does not receive alerts. */
export const STREAM_SYSTEM_USER_ID = "tenth-house";

/** Preview-as-member session id from reviewer tools. Chats still use the demo viewer profile. */
export const PREVIEW_MEMBER_SESSION_ID = "preview-member";

export type StreamMember = {
  id: string;
  name: string;
};

export const STREAM_SESSION_USERS: StreamMember[] = [
  { id: PREVIEW_MEMBER_SESSION_ID, name: "A. Voss" },
  { id: "preview-administrator", name: "Preview Steward" },
  { id: "preview-moderator", name: "Preview Moderator" },
];

/**
 * Curated demo and founding profiles to upsert into Stream.
 * Includes P. Adler. Skips the synthetic field used only for My Circle density.
 */
export function streamSeedRoster(profiles: ProfileRecord[] = demoProfiles): StreamMember[] {
  const picked = profiles.filter((profile) => {
    if (profile.foundingMember) return true;
    if (profile.id === "demo-12" || profile.displayName === "P. Adler") return true;
    if (/^demo-\d{2}$/.test(profile.id)) return true;
    if (profile.id.startsWith("member-")) return true;
    return false;
  });
  const seen = new Set<string>();
  const members: StreamMember[] = [];
  for (const profile of picked) {
    if (seen.has(profile.id)) continue;
    seen.add(profile.id);
    members.push({ id: profile.id, name: profile.displayName });
  }
  return members;
}

/** Stream user ids that should hold this session's push subscription. */
export function sessionPushUserIds(userId: string): string[] {
  const ids = [userId];
  if (userId === PREVIEW_MEMBER_SESSION_ID) ids.push(viewerDemoProfile.id);
  return [...new Set(ids.filter(Boolean))];
}

/** Session id and demo viewer are the same phone when Preview-as-member is signed in. */
export function linkedPushUserIds(userId: string): string[] {
  const ids = new Set(sessionPushUserIds(userId));
  if (userId === viewerDemoProfile.id) ids.add(PREVIEW_MEMBER_SESSION_ID);
  return [...ids];
}
