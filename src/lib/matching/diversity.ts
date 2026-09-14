import type { ProfileRecord } from "@/lib/data/types";
import type { ScoredMatch } from "@/lib/matching/types";

/**
 * Network novelty / cross-pollination.
 * Prevents every member from receiving nearly identical top-10 lists
 * by penalizing globally popular targets and rewarding under-shown ones.
 */
export function popularityPenalty(
  targetId: string,
  alreadyRanked: Map<string, number>,
  memberCount: number,
): number {
  const appearances = alreadyRanked.get(targetId) ?? 0;
  if (memberCount <= 1) return 0.5;
  const saturation = appearances / Math.max(1, memberCount - 1);
  return Math.max(0.05, 1 - saturation);
}

export function rerankForDiversity(matches: ScoredMatch[], take: number): ScoredMatch[] {
  const selected: ScoredMatch[] = [];
  const usedIndustries = new Map<string, number>();
  const usedCities = new Map<string, number>();

  const remaining = [...matches].sort((a, b) => b.weighted - a.weighted);

  while (selected.length < take && remaining.length) {
    let bestIdx = 0;
    let bestAdj = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const m = remaining[i];
      const industryLoad = m.target.industries.reduce(
        (s, ind) => s + (usedIndustries.get(ind) ?? 0),
        0,
      );
      const cityLoad = usedCities.get(m.target.city) ?? 0;
      const adj = m.weighted - industryLoad * 0.04 - cityLoad * 0.03;
      if (adj > bestAdj) {
        bestAdj = adj;
        bestIdx = i;
      }
    }
    const chosen = remaining.splice(bestIdx, 1)[0];
    selected.push(chosen);
    for (const ind of chosen.target.industries) {
      usedIndustries.set(ind, (usedIndustries.get(ind) ?? 0) + 1);
    }
    usedCities.set(chosen.target.city, (usedCities.get(chosen.target.city) ?? 0) + 1);
  }

  return selected;
}

export function industryFingerprint(profile: ProfileRecord): string {
  return [...profile.industries].sort().join("|");
}
