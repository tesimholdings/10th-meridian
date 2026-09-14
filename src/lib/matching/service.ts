import type { ProfileRecord } from "@/lib/data/types";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import {
  applyCuration,
  applyFeedback,
  blocked,
  explanationsFor,
  isEligible,
  scorePair,
  weigh,
} from "@/lib/matching/score";
import { popularityPenalty, rerankForDiversity } from "@/lib/matching/diversity";
import { getEmbeddingProvider, profileCorpus } from "@/lib/matching/embeddings";
import type {
  BlockRecord,
  MatchCuration,
  MatchFeedback,
  MatchingWeights,
  ScoredMatch,
} from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";

export interface MatchServiceInput {
  viewer: ProfileRecord;
  members: ProfileRecord[];
  weights?: MatchingWeights;
  feedback?: MatchFeedback[];
  curation?: MatchCuration[];
  blocks?: BlockRecord[];
  embeddings?: Record<string, number[]>;
  useSemantic?: boolean;
  indexRemovedIds?: string[];
}

export interface MatchIndex {
  meridian10: ScoredMatch[];
  meridian100: ScoredMatch[];
  generatedAt: string;
  viewerId: string;
  weights: MatchingWeights;
  semantic: boolean;
}

const cache = new Map<string, { at: number; value: MatchIndex }>();
const CACHE_MS = 1000 * 60 * 5;

export async function computeMatchIndex(input: MatchServiceInput): Promise<MatchIndex> {
  const weights = input.weights ?? DEFAULT_WEIGHTS;
  const feedback = input.feedback ?? [];
  const curation = input.curation ?? [];
  const blocks = input.blocks ?? [];
  const members = input.members.filter(
    (m) =>
      m.id !== input.viewer.id &&
      isEligible(m) &&
      !blocked(input.viewer.id, m.id, blocks) &&
      !input.indexRemovedIds?.includes(m.id),
  );

  const embeddings = { ...(input.embeddings ?? {}) };
  const semantic = Boolean(input.useSemantic);
  if (semantic) {
    const provider = getEmbeddingProvider();
    const needed = [input.viewer, ...members].filter((m) => !embeddings[m.id]);
    for (const m of needed) {
      embeddings[m.id] = await provider.embed(
        profileCorpus([
          m.goals,
          m.interests,
          m.offers,
          m.needs,
          m.strengths,
          m.industries,
          [m.bio],
        ]),
      );
    }
  }

  const popularity = new Map<string, number>();
  const scored: ScoredMatch[] = [];

  for (const target of members) {
    const novelty = popularityPenalty(target.id, popularity, members.length + 1);
    const raw = scorePair(input.viewer, target, {
      weights,
      novelty,
      embeddings:
        embeddings[input.viewer.id] && embeddings[target.id]
          ? { a: embeddings[input.viewer.id], b: embeddings[target.id] }
          : undefined,
    });
    let weighted = weigh(raw, weights);
    const fb = applyFeedback(weighted, input.viewer.id, target.id, feedback);
    if (fb.hidden || fb.declined) continue;
    weighted = fb.score;
    const cur = applyCuration(weighted, input.viewer.id, target.id, curation);
    if (cur.suppressed) continue;
    popularity.set(target.id, (popularity.get(target.id) ?? 0) + 1);
    scored.push({
      viewerId: input.viewer.id,
      target,
      raw,
      weighted: cur.score,
      source: cur.source,
      curatedNote: cur.note,
      explanations: explanationsFor(input.viewer, target, raw),
      suppressed: false,
    });
  }

  scored.sort((a, b) => b.weighted - a.weighted);
  const diversified = rerankForDiversity(scored, Math.min(100, scored.length));
  const meridian100 = diversified.slice(0, Math.min(100, diversified.length)).map((m, i) => ({
    ...m,
    // rank is assigned after diversity pass
    explanations: i < 10 && m.source === "human_curated" && m.curatedNote
      ? [
          { pillar: "Human curation", text: m.curatedNote },
          ...m.explanations,
        ]
      : m.explanations,
  }));

  return {
    viewerId: input.viewer.id,
    generatedAt: new Date().toISOString(),
    weights,
    semantic,
    meridian10: meridian100.slice(0, 10),
    meridian100,
  };
}

export async function getCachedIndex(
  input: MatchServiceInput,
  cacheKey?: string,
): Promise<MatchIndex> {
  const key = cacheKey ?? input.viewer.id;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = await computeMatchIndex(input);
  cache.set(key, { at: Date.now(), value });
  return value;
}

export function invalidateMatchCache(viewerId?: string) {
  if (!viewerId) {
    cache.clear();
    return;
  }
  cache.delete(viewerId);
}

export async function demoIndexFor(
  viewer?: ProfileRecord,
  overrides?: Partial<MatchServiceInput>,
): Promise<MatchIndex> {
  const store = getPreviewStore();
  const subject = viewer ?? viewerProfile();
  return computeMatchIndex({
    viewer: subject,
    members: store.profiles,
    weights: store.weights,
    feedback: store.feedback,
    curation: store.curation,
    blocks: store.crossings.blocks,
    indexRemovedIds: store.indexRemovals
      .filter((r) => r.viewerId === subject.id)
      .map((r) => r.targetId),
    useSemantic: true,
    ...overrides,
  });
}
