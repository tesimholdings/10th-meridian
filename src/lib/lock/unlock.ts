import { demoProfiles, demoReferrals } from "@/lib/data/demo";
import type { ProfileRecord, ReferralRecord } from "@/lib/data/types";
import { memberReferralCode } from "@/lib/rewards/identity";
import { validateReferralCode } from "@/lib/referrals/validate";

export const DEMO_UNLOCK_EMAIL_DOMAIN = "preview.10thmeridian.test";

export const UNLOCK_MISS_MESSAGE = "That cannot open the house.";

export type UnlockResolution =
  | { kind: "member"; profile: ProfileRecord; email: string }
  | { kind: "referral"; code: string }
  | { kind: "miss" };

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

/**
 * Preview-only lock resolver. Matches demo members (name, username, email)
 * or a currently valid referral code. Never distinguishes why a value failed.
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

  const members = memberIndex(profiles);
  const key = needle(value);
  const local = key.includes("@") ? key.split("@")[0] ?? key : key;
  const profile = members.get(key) ?? (local !== key ? members.get(local) : undefined);
  if (profile) {
    return { kind: "member", profile, email: demoEmailFor(profile) };
  }

  return { kind: "miss" };
}
