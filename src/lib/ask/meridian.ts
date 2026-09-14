import type { ProfileRecord } from "@/lib/data/types";

export interface AskHit {
  profileId: string;
  displayName: string;
  headline: string;
  reason: string;
  score: number;
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function blob(profile: ProfileRecord): string {
  return [
    profile.headline,
    profile.bio,
    profile.roleTitle,
    profile.company,
    ...profile.offers,
    ...profile.needs,
    ...profile.strengths,
    ...profile.goals,
    ...profile.industries,
    ...profile.interests,
  ]
    .join(" ")
    .toLowerCase();
}

/** Lightweight NL help-finding for Ask the Meridian / Who can help. Never invents people. */
export function askTheMeridian(
  query: string,
  profiles: ProfileRecord[],
  viewerId: string,
): AskHit[] {
  const q = tokens(query);
  if (q.length === 0) return [];
  const hits: AskHit[] = [];
  for (const profile of profiles) {
    if (profile.id === viewerId) continue;
    const hay = blob(profile);
    let score = 0;
    const matched: string[] = [];
    for (const token of q) {
      if (hay.includes(token)) {
        score += 1;
        matched.push(token);
      }
    }
    if (score === 0) continue;
    const offerHit = profile.offers.find((o) => q.some((t) => o.toLowerCase().includes(t)));
    hits.push({
      profileId: profile.id,
      displayName: profile.displayName,
      headline: profile.headline,
      reason: offerHit
        ? `Can help with: ${offerHit}`
        : `Signal on ${matched.slice(0, 3).join(", ")}.`,
      score,
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}
