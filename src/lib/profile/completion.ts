import type { ProfileRecord } from "@/lib/data/types";

export function profileCompletion(profile: ProfileRecord): number {
  const checks = [
    Boolean(profile.displayName),
    Boolean(profile.headline),
    Boolean(profile.bio),
    Boolean(profile.roleTitle),
    Boolean(profile.company),
    Boolean(profile.city && profile.country),
    Boolean(profile.timezone),
    profile.industries.length > 0,
    profile.interests.length > 0,
    profile.goals.length > 0,
    profile.strengths.length > 0,
    profile.offers.length > 0,
    profile.needs.length > 0,
    profile.travel.length > 0,
    profile.preferredConnectionTypes.length > 0,
    Boolean(profile.communicationStyle),
    Boolean(profile.availability),
    profile.causes.length > 0 || profile.values.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function completionMessage(score: number): string {
  if (score >= 90) return "The Index has enough to be precise.";
  if (score >= 70) return "Matching is useful. A few more fields will sharpen it.";
  if (score >= 40) return "The signal is faint. Completeness changes who appears next.";
  return "Begin onboarding — the Index cannot invent what you have not said.";
}
