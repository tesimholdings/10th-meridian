import type { ProfileRecord } from "@/lib/data/types";
import { connectionFromLegacy, type SocialConnection } from "@/lib/onboarding/socials";

export const APPLY_DRAFT_KEY = "tm-application";
export const MEMBER_DRAFT_KEY = "tm-onboarding";

export interface ExperienceDraft {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  timezone: string;
  roleTitle: string;
  company: string;
  headline: string;
  bio: string;
  intents: string[];
  intentOther: string;
  socials: SocialConnection[];
  offers: string;
  needs: string;
  strengths: string;
  industries: string;
  interests: string;
  goals: string;
  referralCode: string;
  discoverySource: string;
  terms: string;
}

export function emptyDraft(partial?: Partial<ExperienceDraft>): ExperienceDraft {
  return {
    fullName: "",
    displayName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    timezone: "",
    roleTitle: "",
    company: "",
    headline: "",
    bio: "",
    intents: [],
    intentOther: "",
    socials: [],
    offers: "",
    needs: "",
    strengths: "",
    industries: "",
    interests: "",
    goals: "",
    referralCode: "",
    discoverySource: "",
    terms: "",
    ...partial,
  };
}

export function draftFromProfile(profile: ProfileRecord, referralCode = ""): ExperienceDraft {
  const socials =
    profile.socials && profile.socials.length > 0
      ? profile.socials
      : connectionFromLegacy({ website: profile.website, linkedin: profile.linkedin });
  return emptyDraft({
    fullName: profile.displayName,
    displayName: profile.displayName,
    city: profile.city,
    country: profile.country,
    timezone: profile.timezone,
    roleTitle: profile.roleTitle,
    company: profile.company,
    headline: profile.headline,
    bio: profile.bio,
    intents: profile.intents ?? [],
    intentOther: profile.intentOther ?? "",
    socials,
    offers: profile.offers.join(", "),
    needs: profile.needs.join(", "),
    strengths: profile.strengths.join(", "),
    industries: profile.industries.join(", "),
    interests: profile.interests.join(", "),
    goals: profile.goals.join(", "),
    referralCode,
  });
}

export function readDraft(key: string): Partial<ExperienceDraft> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ExperienceDraft>;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, draft: ExperienceDraft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* ignore quota */
  }
}

export function csvList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function identityReady(draft: ExperienceDraft, mode: "apply" | "member"): boolean {
  const name = (mode === "apply" ? draft.fullName : draft.displayName).trim();
  if (name.length < 2) return false;
  if (mode === "apply" && !draft.email.includes("@")) return false;
  if (!draft.city.trim() || !draft.country.trim()) return false;
  if (!draft.roleTitle.trim()) return false;
  return true;
}
