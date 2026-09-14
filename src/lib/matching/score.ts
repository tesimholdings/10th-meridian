import type { ProfileRecord } from "@/lib/data/types";
import { cosine } from "@/lib/matching/embeddings";
import type {
  MatchCuration,
  MatchFeedback,
  MatchingWeights,
  PairBreakdown,
  ScoredMatch,
} from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";

function norm(items: string[]): string[] {
  return items.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function overlap(a: string[], b: string[]): string[] {
  const sb = new Set(norm(b));
  return norm(a).filter((x) => sb.has(x));
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(norm(a));
  const B = new Set(norm(b));
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function softOverlap(a: string[], b: string[]): { score: number; hits: string[] } {
  const exact = overlap(a, b);
  if (a.length === 0 || b.length === 0) return { score: 0, hits: exact };
  const tokenHits: string[] = [...exact];
  for (const left of norm(a)) {
    for (const right of norm(b)) {
      if (left === right) continue;
      if (left.includes(right) || right.includes(left)) {
        tokenHits.push(`${left} ~ ${right}`);
      }
    }
  }
  const unique = [...new Set(tokenHits)];
  const score = Math.min(1, unique.length / Math.max(2, Math.min(a.length, b.length)));
  return { score, hits: unique.slice(0, 4) };
}

/**
 * Reciprocal value: one member's offer/strength meets the other's need.
 */
export function complementaryScore(a: ProfileRecord, b: ProfileRecord) {
  const aToB = softOverlap([...a.offers, ...a.strengths], [...b.needs]);
  const bToA = softOverlap([...b.offers, ...b.strengths], [...a.needs]);
  const notes = [
    ...aToB.hits.map((h) => `${a.displayName} can meet a need: ${h}`),
    ...bToA.hits.map((h) => `${b.displayName} can meet a need: ${h}`),
  ];
  const score = Math.min(1, (aToB.score + bToA.score) / 1.4 + (aToB.hits.length && bToA.hits.length ? 0.15 : 0));
  return { score, notes };
}

export function scorePair(
  a: ProfileRecord,
  b: ProfileRecord,
  options?: {
    weights?: MatchingWeights;
    embeddings?: { a: number[]; b: number[] };
    novelty?: number;
  },
): PairBreakdown {
  const comp = complementaryScore(a, b);
  const goals = softOverlap(
    [...a.goals, ...a.ambitions, ...a.projects],
    [...b.goals, ...b.ambitions, ...b.projects],
  );
  const interests = softOverlap(
    [...a.interests, ...a.values, ...a.causes],
    [...b.interests, ...b.values, ...b.causes],
  );
  const industry = Math.max(
    jaccard(a.industries, b.industries),
    softOverlap(a.industries, b.industries).score * 0.85,
  );
  const geoExact = jaccard(
    [...a.geography, a.city, a.country],
    [...b.geography, b.city, b.country],
  );
  const travel = jaccard(a.travel, b.travel);
  const timezoneNear =
    a.timezone.split("/")[0] === b.timezone.split("/")[0] ? 0.25 : 0;
  const geography = Math.min(1, geoExact * 0.7 + travel * 0.5 + timezoneNear);

  const prefOverlap = jaccard(a.preferredConnectionTypes, b.preferredConnectionTypes);
  const avail =
    a.availability === "paused" || b.availability === "paused"
      ? 0
      : a.availability === "open" || b.availability === "open"
        ? 0.8
        : 0.55;
  const preferences = prefOverlap * 0.5 + avail * 0.5;

  let semanticBoost = 0;
  if (options?.embeddings) {
    semanticBoost = Math.max(0, cosine(options.embeddings.a, options.embeddings.b));
  }

  return {
    complementary: clamp01(comp.score),
    goals: clamp01(goals.score * 0.75 + semanticBoost * 0.25),
    interests: clamp01(interests.score * 0.7 + semanticBoost * 0.3),
    industry: clamp01(industry),
    geography: clamp01(geography),
    preferences: clamp01(preferences),
    novelty: clamp01(options?.novelty ?? 0.5),
    complementaryNotes: comp.notes,
    goalNotes: goals.hits,
    interestNotes: interests.hits,
  };
}

export function weigh(raw: PairBreakdown, weights: MatchingWeights = DEFAULT_WEIGHTS): number {
  const w = normalizeWeights(weights);
  return clamp01(
    raw.complementary * w.complementary +
      raw.goals * w.goals +
      raw.interests * w.interests +
      raw.industry * w.industry +
      raw.geography * w.geography +
      raw.preferences * w.preferences +
      raw.novelty * w.novelty,
  );
}

export function normalizeWeights(weights: MatchingWeights): MatchingWeights {
  const sum =
    weights.complementary +
    weights.goals +
    weights.interests +
    weights.industry +
    weights.geography +
    weights.preferences +
    weights.novelty;
  if (sum <= 0) return DEFAULT_WEIGHTS;
  return {
    complementary: weights.complementary / sum,
    goals: weights.goals / sum,
    interests: weights.interests / sum,
    industry: weights.industry / sum,
    geography: weights.geography / sum,
    preferences: weights.preferences / sum,
    novelty: weights.novelty / sum,
  };
}

export function applyFeedback(
  score: number,
  viewerId: string,
  targetId: string,
  feedback: MatchFeedback[],
): { score: number; declined: boolean; hidden: boolean } {
  const signals = feedback.filter(
    (f) => f.viewerId === viewerId && f.targetId === targetId,
  );
  let next = score;
  let declined = false;
  let hidden = false;
  for (const s of signals) {
    if (s.signal === "hidden") hidden = true;
    if (s.signal === "declined" || s.signal === "not_relevant") {
      declined = true;
      next -= 0.45;
    }
    if (s.signal === "relevant" || s.signal === "accepted") next += 0.08;
    if (s.signal === "introduced") next += 0.04;
  }
  return { score: clamp01(next), declined, hidden };
}

export function applyCuration(
  score: number,
  viewerId: string,
  targetId: string,
  curation: MatchCuration[],
): { score: number; source: ScoredMatch["source"]; note?: string; suppressed: boolean } {
  const hit = curation.find((c) => c.viewerId === viewerId && c.targetId === targetId);
  if (!hit) return { score, source: "algorithmic", suppressed: false };
  if (hit.action === "suppress") {
    return { score: 0, source: "human_curated", note: hit.reason, suppressed: true };
  }
  return {
    score: clamp01(score + 0.2),
    source: "human_curated",
    note: hit.reason,
    suppressed: false,
  };
}

export function explanationsFor(
  viewer: ProfileRecord,
  target: ProfileRecord,
  raw: PairBreakdown,
): { pillar: string; text: string }[] {
  const out: { pillar: string; text: string }[] = [];
  if (raw.complementaryNotes[0]) {
    out.push({
      pillar: "Reciprocal value",
      text: raw.complementaryNotes[0],
    });
  }
  if (raw.goalNotes[0]) {
    out.push({
      pillar: "Goals",
      text: `Shared or adjacent ambition: ${raw.goalNotes[0]}.`,
    });
  }
  if (raw.interestNotes[0]) {
    out.push({
      pillar: "Interests",
      text: `A held-in-common current: ${raw.interestNotes[0]}.`,
    });
  }
  const sharedIndustry = overlap(viewer.industries, target.industries);
  if (sharedIndustry[0]) {
    out.push({
      pillar: "Industry",
      text: `Useful adjacency in ${sharedIndustry[0]}.`,
    });
  } else if (raw.industry > 0.2) {
    out.push({
      pillar: "Industry",
      text: "Different fields, close enough to be useful.",
    });
  }
  if (viewer.city === target.city || overlap(viewer.geography, target.geography)[0]) {
    out.push({
      pillar: "Geography",
      text: `Overlapping ground: ${overlap([viewer.city, ...viewer.geography], [target.city, ...target.geography])[0] ?? viewer.city}.`,
    });
  } else if (overlap(viewer.travel, target.travel)[0]) {
    out.push({
      pillar: "Travel",
      text: `Routes may cross: ${overlap(viewer.travel, target.travel)[0]}.`,
    });
  }
  if (out.length === 0) {
    out.push({
      pillar: "Signal",
      text: "A quiet compatibility — more complete profiles will sharpen this.",
    });
  }
  return out.slice(0, 3);
}

export function isEligible(target: ProfileRecord): boolean {
  if (target.availability === "paused") return false;
  if (target.visibility === "hidden") return false;
  return true;
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function blocked(viewerId: string, targetId: string, blocks: { a: string; b: string }[]): boolean {
  return blocks.some(
    (b) =>
      (b.a === viewerId && b.b === targetId) || (b.a === targetId && b.b === viewerId),
  );
}
