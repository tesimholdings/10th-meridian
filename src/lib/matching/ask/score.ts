import type { ProfileRecord } from "@/lib/data/types";
import type { MembershipStanding } from "@/lib/crossings/types";
import { cosine } from "@/lib/matching/embeddings";
import {
  applyCuration,
  applyFeedback,
  blocked,
  clamp01,
  explanationsFor,
  isEligible,
  jaccard,
  overlap,
  scorePair,
  softOverlap,
  weigh,
} from "@/lib/matching/score";
import type {
  AskBreakdown,
  AskFeedback,
  AskIntent,
  AskMatchWeights,
  ParsedAsk,
  ScoredAskMatch,
} from "@/lib/matching/ask/types";
import { DEFAULT_ASK_WEIGHTS } from "@/lib/matching/ask/types";
import type {
  BlockRecord,
  MatchCuration,
  MatchFeedback,
  MatchingWeights,
} from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";
import { standingOf } from "@/lib/crossings/privacy";

const INTENT_SUPPLY: Record<AskIntent, string[]> = {
  capital: [
    "investor",
    "first-check",
    "first check",
    "series a",
    "capital",
    "term-sheet",
    "term sheet",
    "venture",
    "diligence",
    "finance",
    "funding",
  ],
  hiring: ["hiring", "talent", "recruit", "teams", "headcount"],
  advice: ["counsel", "advisor", "mentor", "editorial", "board", "guidance"],
  collaboration: ["collaborator", "partner", "collaboration", "together"],
  intro: ["introduction", "introductions", "intro", "structured introductions"],
  ops: ["operator", "operating", "operations", "systems", "service", "cadence"],
  creative: ["film", "design", "visual", "salon", "culture", "creative", "editorial"],
  other: [],
};

export function normalizeAskWeights(weights: AskMatchWeights): AskMatchWeights {
  const sum =
    weights.complementary +
    weights.meridian +
    weights.industry +
    weights.geography +
    weights.availability +
    weights.semantic;
  if (sum <= 0) return DEFAULT_ASK_WEIGHTS;
  return {
    complementary: weights.complementary / sum,
    meridian: weights.meridian / sum,
    industry: weights.industry / sum,
    geography: weights.geography / sum,
    availability: weights.availability / sum,
    semantic: weights.semantic / sum,
  };
}

/**
 * Asymmetric complementarity: their offers/strengths versus the stated need.
 * This is the primary Ask the Meridian signal — not “people like me.”
 */
export function askComplementary(target: ProfileRecord, parsed: ParsedAsk) {
  const supply = [
    ...target.offers,
    ...target.strengths,
    ...target.valuedOpportunities,
    target.roleTitle,
    target.headline,
    ...target.industries,
  ];
  const demand = [
    ...parsed.needs,
    ...parsed.goals,
    ...parsed.tokens,
    ...parsed.industries,
    ...parsed.intents,
  ];
  const meet = softOverlap(supply, demand);
  const intentHits: string[] = [];
  let intentBoost = 0;
  for (const intent of parsed.intents) {
    const lex = INTENT_SUPPLY[intent];
    const hit = softOverlap(supply, lex);
    if (hit.hits.length) {
      intentHits.push(...hit.hits);
      intentBoost += 0.12;
    }
  }
  const notes = [
    ...meet.hits.map((h) => `${target.displayName} can meet this need: ${h}`),
    ...intentHits.slice(0, 2).map((h) => `Intent adjacency: ${h}`),
  ];
  const score = Math.min(1, meet.score * 0.85 + Math.min(0.3, intentBoost));
  return { score, notes: notes.slice(0, 4) };
}

export function askIndustryScore(target: ProfileRecord, parsed: ParsedAsk): { score: number; hits: string[] } {
  const asked = [...parsed.industries, ...(parsed.filters.industry ? [parsed.filters.industry] : [])];
  if (asked.length === 0) return { score: 0.15, hits: [] };
  const exact = overlap(target.industries, asked);
  const soft = softOverlap(target.industries, asked);
  return { score: Math.max(jaccard(target.industries, asked), soft.score), hits: exact.length ? exact : soft.hits };
}

export function askGeographyScore(target: ProfileRecord, parsed: ParsedAsk): { score: number; hits: string[] } {
  const asked = [...parsed.geography, ...(parsed.filters.location ? [parsed.filters.location] : [])];
  if (asked.length === 0) return { score: 0.2, hits: [] };
  const theirs = [target.city, target.country, ...target.geography, ...target.travel];
  const exact = overlap(theirs, asked);
  const soft = softOverlap(theirs, asked);
  return { score: Math.max(jaccard(theirs, asked), soft.score), hits: exact.length ? exact : soft.hits };
}

export function askAvailabilityScore(target: ProfileRecord, parsed: ParsedAsk): number {
  if (target.availability === "paused") return 0;
  const asked = parsed.filters.availability?.toLowerCase();
  if (asked && !target.availability.includes(asked) && asked !== target.availability) {
    return 0;
  }
  if (target.availability === "open") return 0.9;
  if (target.availability === "selective") return 0.7;
  return 0.45;
}

export function passesAskFilters(target: ProfileRecord, parsed: ParsedAsk): boolean {
  const { filters } = parsed;
  if (filters.location) {
    const blob = `${target.city} ${target.country} ${target.geography.join(" ")} ${target.travel.join(" ")}`.toLowerCase();
    if (!blob.includes(filters.location.toLowerCase())) return false;
  }
  if (filters.industry) {
    const blob = target.industries.join(" ").toLowerCase();
    if (!blob.includes(filters.industry.toLowerCase())) return false;
  }
  if (filters.availability) {
    if (!target.availability.toLowerCase().includes(filters.availability.toLowerCase())) return false;
  }
  if (filters.offer) {
    const blob = [...target.offers, ...target.strengths].join(" ").toLowerCase();
    if (!blob.includes(filters.offer.toLowerCase())) return false;
  }
  if (filters.need) {
    const blob = target.needs.join(" ").toLowerCase();
    if (!blob.includes(filters.need.toLowerCase())) return false;
  }
  return true;
}

export function isAskEligible(
  target: ProfileRecord,
  options: {
    viewerId: string;
    blocks?: BlockRecord[];
    standings?: Record<string, MembershipStanding>;
  },
): boolean {
  if (target.id === options.viewerId) return false;
  if (!isEligible(target)) return false;
  const standing = standingOf(target.id, options.standings);
  if (standing === "expired" || standing === "suspended") return false;
  if (blocked(options.viewerId, target.id, options.blocks ?? [])) return false;
  return true;
}

export function visibleAskMembers(
  members: ProfileRecord[],
  isMemberAccess: boolean,
): ProfileRecord[] {
  if (isMemberAccess) return members;
  return members.filter((m) => m.isDemo);
}

export function scoreAskPair(
  viewer: ProfileRecord,
  target: ProfileRecord,
  parsed: ParsedAsk,
  options?: {
    askWeights?: AskMatchWeights;
    indexWeights?: MatchingWeights;
    embeddings?: { ask: number[]; target: number[] };
  },
): AskBreakdown {
  const comp = askComplementary(target, parsed);
  const industry = askIndustryScore(target, parsed);
  const geography = askGeographyScore(target, parsed);
  const availability = askAvailabilityScore(target, parsed);
  const meridianRaw = scorePair(viewer, target, {
    weights: options?.indexWeights ?? DEFAULT_WEIGHTS,
    embeddings:
      options?.embeddings?.ask && options.embeddings.target
        ? { a: options.embeddings.ask, b: options.embeddings.target }
        : undefined,
  });
  const meridian = weigh(meridianRaw, options?.indexWeights ?? DEFAULT_WEIGHTS);
  let semantic = 0;
  if (options?.embeddings) {
    semantic = Math.max(0, cosine(options.embeddings.ask, options.embeddings.target));
  }
  return {
    complementary: clamp01(comp.score),
    meridian: clamp01(meridian),
    industry: clamp01(industry.score),
    geography: clamp01(geography.score),
    availability: clamp01(availability),
    semantic: clamp01(semantic),
    complementaryNotes: comp.notes,
    industryNotes: industry.hits,
    geographyNotes: geography.hits,
    meridianRaw,
  };
}

export function weighAsk(raw: AskBreakdown, weights: AskMatchWeights = DEFAULT_ASK_WEIGHTS): number {
  const w = normalizeAskWeights(weights);
  return clamp01(
    raw.complementary * w.complementary +
      raw.meridian * w.meridian +
      raw.industry * w.industry +
      raw.geography * w.geography +
      raw.availability * w.availability +
      raw.semantic * w.semantic,
  );
}

export function explanationsForAsk(
  viewer: ProfileRecord,
  target: ProfileRecord,
  parsed: ParsedAsk,
  raw: AskBreakdown,
): { pillar: string; text: string }[] {
  const out: { pillar: string; text: string }[] = [];
  if (raw.complementaryNotes[0]) {
    out.push({
      pillar: "They can help",
      text: raw.complementaryNotes[0],
    });
  }
  if (raw.industryNotes[0]) {
    out.push({
      pillar: "Industry",
      text: `Useful adjacency in ${raw.industryNotes[0]}.`,
    });
  }
  if (raw.geographyNotes[0]) {
    out.push({
      pillar: "Geography",
      text: `Overlapping ground: ${raw.geographyNotes[0]}.`,
    });
  }
  const meridianWhy = explanationsFor(viewer, target, raw.meridianRaw);
  for (const item of meridianWhy) {
    if (out.length >= 3) break;
    if (out.some((e) => e.pillar === item.pillar)) continue;
    out.push(item);
  }
  if (out.length === 0) {
    out.push({
      pillar: "Signal",
      text:
        parsed.query.length > 0
          ? "A quiet fit for this ask — more complete profiles will sharpen this."
          : "A quiet compatibility — more complete profiles will sharpen this.",
    });
  }
  return out.slice(0, 3);
}

export function applyAskFeedback(
  score: number,
  viewerId: string,
  targetId: string,
  askId: string,
  feedback: AskFeedback[],
  indexFeedback: MatchFeedback[],
): { score: number; declined: boolean; hidden: boolean; saved: boolean } {
  const askSignals = feedback.filter(
    (f) => f.viewerId === viewerId && f.targetId === targetId && f.askId === askId,
  );
  const index = applyFeedback(score, viewerId, targetId, indexFeedback);
  let next = index.score;
  let declined = index.declined;
  let hidden = index.hidden;
  let saved = false;
  for (const s of askSignals) {
    if (s.signal === "hidden") hidden = true;
    if (s.signal === "not_relevant") {
      declined = true;
      next -= 0.45;
    }
    if (s.signal === "relevant") next += 0.08;
    if (s.signal === "saved") {
      saved = true;
      next += 0.05;
    }
  }
  return { score: clamp01(next), declined, hidden, saved };
}

export function applyAskCuration(
  score: number,
  viewerId: string,
  targetId: string,
  curation: MatchCuration[],
) {
  return applyCuration(score, viewerId, targetId, curation);
}

export const ASK_SCORE_FLOOR = 0.08;

export function assembleAskMatch(input: {
  viewer: ProfileRecord;
  target: ProfileRecord;
  askId: string;
  parsed: ParsedAsk;
  raw: AskBreakdown;
  weighted: number;
  source: ScoredAskMatch["source"];
  curatedNote?: string;
  saved: boolean;
}): ScoredAskMatch {
  return {
    viewerId: input.viewer.id,
    askId: input.askId,
    target: input.target,
    raw: input.raw,
    weighted: input.weighted,
    source: input.source,
    curatedNote: input.curatedNote,
    explanations: explanationsForAsk(input.viewer, input.target, input.parsed, input.raw),
    saved: input.saved,
  };
}
