import type { SessionUser } from "@/lib/access/session";

/** True when this session is the in-house sample, not a signed-in member account. */
export function isSyntheticSession(user: SessionUser | null): boolean {
  if (!user) return true;
  if (user.isDemo) return true;
  const id = user.id.toLowerCase();
  if (id.startsWith("demo-") || id.startsWith("preview-")) return true;
  if (user.email.toLowerCase().endsWith("@preview.10thmeridian.test")) return true;
  return false;
}

export function firstName(name: string): string {
  const token = name.trim().split(/\s+/).filter(Boolean)[0];
  return token || name.trim() || "Member";
}

/**
 * Home greeting. A signed-in name wins over the seed profile.
 * The seed name is only the fallback when the session has no name.
 */
export function greetingName(user: SessionUser | null, seedName: string): string {
  const named = user?.name?.trim();
  if (named) return firstName(named);
  return firstName(seedName);
}

/** Profile id that may own trips, circle edges, and rewards for this session. */
export function sessionSubjectId(user: SessionUser | null, seedProfileId: string): string {
  if (!user || isSyntheticSession(user)) return seedProfileId;
  return user.id;
}
