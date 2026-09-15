import { demoProfiles, demoReferrals } from "@/lib/data/demo";
import type { ProfileRecord, ReferralRecord } from "@/lib/data/types";
import { memberReferralCode } from "@/lib/rewards/identity";
import { validateReferralCode } from "@/lib/referrals/validate";

export const DEMO_UNLOCK_EMAIL_DOMAIN = "preview.10thmeridian.test";

export const UNLOCK_MISS_MESSAGE = "That cannot open the house.";

export const FORGOT_PASSWORD_MESSAGE =
  "If an account exists, a reset note is sent.";

export type StewardRole = "administrator" | "moderator";

export type UnlockResolution =
  | { kind: "member"; profile: ProfileRecord; email: string }
  | { kind: "steward"; role: StewardRole; name: string; email: string }
  | { kind: "referral"; code: string }
  | { kind: "miss" };

export type LockIdentityClassification =
  | { kind: "empty" }
  | { kind: "referral"; code: string }
  | { kind: "credentials" };

const DEMO_STEWARDS: Record<
  string,
  { role: StewardRole; name: string; email: string }
> = {
  steward: {
    role: "administrator",
    name: "Preview Steward",
    email: `steward@${DEMO_UNLOCK_EMAIL_DOMAIN}`,
  },
  admin: {
    role: "administrator",
    name: "Preview Steward",
    email: `admin@${DEMO_UNLOCK_EMAIL_DOMAIN}`,
  },
  administrator: {
    role: "administrator",
    name: "Preview Steward",
    email: `administrator@${DEMO_UNLOCK_EMAIL_DOMAIN}`,
  },
  moderator: {
    role: "moderator",
    name: "Preview Moderator",
    email: `moderator@${DEMO_UNLOCK_EMAIL_DOMAIN}`,
  },
};

export function demoEmailFor(profile: ProfileRecord): string {
  return `${emailLocalPart(profile.displayName)}@${DEMO_UNLOCK_EMAIL_DOMAIN}`;
}

function emailLocalPart(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function aliasesFor(profile: ProfileRecord): string[] {
  const name = profile.displayName.trim();
  const lower = name.toLowerCase();
  const compact = lower.replace(/[^a-z0-9]/g, "");
  const hyphen = lower.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const dotted = emailLocalPart(name);
  const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  const email = demoEmailFor(profile);
  const first = tokens[0];
  const firstEmail = first ? `${first}@${DEMO_UNLOCK_EMAIL_DOMAIN}` : "";
  const personal = memberReferralCode({
    id: profile.id,
    displayName: profile.displayName,
    initials: profile.initials,
  }).toLowerCase();

  return unique([
    lower,
    compact,
    hyphen,
    dotted,
    email,
    dotted,
    firstEmail,
    profile.id.toLowerCase(),
    profile.accountId.toLowerCase(),
    personal,
    ...tokens,
  ]);
}

function memberIndex(profiles: ProfileRecord[]): Map<string, ProfileRecord> {
  const hits = new Map<string, ProfileRecord>();
  for (const profile of profiles) {
    for (const alias of aliasesFor(profile)) {
      const key = alias.toLowerCase();
      if (!hits.has(key)) hits.set(key, profile);
    }
  }
  return hits;
}

function needle(raw: string): string {
  return raw.trim().toLowerCase();
}

function stewardFor(raw: string): Extract<UnlockResolution, { kind: "steward" }> | null {
  const key = needle(raw);
  const local = key.includes("@") ? key.split("@")[0] ?? key : key;
  const hit = DEMO_STEWARDS[key] ?? (local !== key ? DEMO_STEWARDS[local] : undefined);
  if (!hit) return null;
  return { kind: "steward", ...hit };
}

/**
 * Preview lock resolver. Matches a live referral, a demo steward alias, or a
 * demo member (name, username, email). Never distinguishes why a value failed.
 */
export function resolveLockUnlock(
  raw: string,
  options?: {
    profiles?: ProfileRecord[];
    referrals?: ReferralRecord[];
    now?: Date;
  },
): UnlockResolution {
  const value = raw.trim();
  if (!value) return { kind: "miss" };

  const profiles = options?.profiles ?? demoProfiles;
  const referrals = options?.referrals ?? demoReferrals;
  const now = options?.now ?? new Date();

  const referral = validateReferralCode(value, now, referrals);
  if (referral.ok) {
    const match = referrals.find(
      (r) =>
        r.code.toUpperCase() === value.toUpperCase() ||
        r.token.toUpperCase() === value.toUpperCase(),
    );
    return { kind: "referral", code: match?.code ?? value.trim() };
  }

  const steward = stewardFor(value);
  if (steward) return steward;

  const members = memberIndex(profiles);
  const key = needle(value);
  const local = key.includes("@") ? key.split("@")[0] ?? key : key;
  const profile = members.get(key) ?? (local !== key ? members.get(local) : undefined);
  if (profile) {
    return { kind: "member", profile, email: demoEmailFor(profile) };
  }

  return { kind: "miss" };
}

/**
 * First lock step. Valid referrals unlock immediately. Anything else non-empty
 * continues to the password step so unknown names are not distinguished.
 */
export function classifyLockIdentity(
  raw: string,
  options?: {
    profiles?: ProfileRecord[];
    referrals?: ReferralRecord[];
    now?: Date;
  },
): LockIdentityClassification {
  const value = raw.trim();
  if (!value) return { kind: "empty" };
  const hit = resolveLockUnlock(value, options);
  if (hit.kind === "referral") return { kind: "referral", code: hit.code };
  return { kind: "credentials" };
}

/** Map a typed username / alias to an email for Auth, without inventing secrets. */
export function emailCandidateFromIdentity(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (value.includes("@")) return value;
  const hit = resolveLockUnlock(value);
  if (hit.kind === "member") return hit.email;
  if (hit.kind === "steward") return hit.email;
  return value;
}
