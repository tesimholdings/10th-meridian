import type { ProfileRecord } from "@/lib/data/types";
import type { MembershipStanding } from "@/lib/crossings/types";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { getEmbeddingProvider, profileCorpus } from "@/lib/matching/embeddings";
import { rerankForDiversity } from "@/lib/matching/diversity";
import { parseAsk } from "@/lib/matching/ask/parse";
import {
  applyAskCuration,
  applyAskFeedback,
  ASK_SCORE_FLOOR,
  assembleAskMatch,
  isAskEligible,
  normalizeAskWeights,
  passesAskFilters,
  scoreAskPair,
  visibleAskMembers,
  weighAsk,
} from "@/lib/matching/ask/score";
import type {
  AskFeedback,
  AskFilters,
  AskIndex,
  AskIntent,
  AskMatchWeights,
  HelpAskRecord,
  ParsedAsk,
  ScoredAskMatch,
} from "@/lib/matching/ask/types";
import { DEFAULT_ASK_WEIGHTS } from "@/lib/matching/ask/types";
import type { BlockRecord, MatchCuration, MatchFeedback, MatchingWeights, ScoredMatch } from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";

export interface AskServiceInput {
  viewer: ProfileRecord;
  members: ProfileRecord[];
  query?: string;
  intents?: AskIntent[];
  filters?: AskFilters;
  askId?: string;
  askWeights?: AskMatchWeights;
  indexWeights?: MatchingWeights;
  feedback?: AskFeedback[];
  indexFeedback?: MatchFeedback[];
  curation?: MatchCuration[];
  blocks?: BlockRecord[];
  standings?: Record<string, MembershipStanding>;
  embeddings?: Record<string, number[]>;
  useSemantic?: boolean;
  isMemberAccess?: boolean;
}

const cache = new Map<string, { at: number; value: AskIndex }>();
const CACHE_MS = 1000 * 60 * 5;

function askId(): string {
  return `ask-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function askCacheKey(input: {
  viewerId: string;
  query?: string;
  intents?: AskIntent[];
  filters?: AskFilters;
}): string {
  const filters = input.filters ?? {};
  return [
    input.viewerId,
    (input.query ?? "").trim().toLowerCase(),
    [...(input.intents ?? [])].sort().join(","),
    filters.location ?? "",
    filters.industry ?? "",
    filters.availability ?? "",
    filters.offer ?? "",
    filters.need ?? "",
  ].join("::");
}

function emptyAsk(viewerId: string, parsed: ParsedAsk, weights: AskMatchWeights, openHouseIsolation: boolean): AskIndex {
  const ask: HelpAskRecord = {
    id: "ask-empty",
    viewerId,
    query: parsed.query,
    intents: parsed.intents,
    parsed,
    filters: parsed.filters,
    createdAt: new Date().toISOString(),
    isDemo: true,
  };
  return {
    ask,
    people: [],
    generatedAt: new Date().toISOString(),
    viewerId,
    weights,
    semantic: false,
    emptyQuery: true,
    openHouseIsolation,
  };
}

export async function computeAskIndex(input: AskServiceInput): Promise<AskIndex> {
  const weights = normalizeAskWeights(input.askWeights ?? DEFAULT_ASK_WEIGHTS);
  const indexWeights = input.indexWeights ?? DEFAULT_WEIGHTS;
  const parsed = parseAsk({
    query: input.query,
    intents: input.intents,
    filters: input.filters,
  });
  const isMemberAccess = input.isMemberAccess !== false;
  const openHouseIsolation = !isMemberAccess;

  if (parsed.empty) {
    return emptyAsk(input.viewer.id, parsed, weights, openHouseIsolation);
  }

  const pool = visibleAskMembers(input.members, isMemberAccess).filter((m) =>
    isAskEligible(m, {
      viewerId: input.viewer.id,
      blocks: input.blocks,
      standings: input.standings,
    }),
  );
  const members = pool.filter((m) => passesAskFilters(m, parsed));

  const embeddings = { ...(input.embeddings ?? {}) };
  const semantic = Boolean(input.useSemantic);
  const askCorpus = profileCorpus([
    parsed.needs,
    parsed.goals,
    parsed.industries,
    parsed.geography,
    parsed.tokens,
    [parsed.query],
  ]);
  if (semantic) {
    const provider = getEmbeddingProvider();
    embeddings.__ask = await provider.embed(askCorpus);
    for (const m of members) {
      if (!embeddings[m.id]) {
        embeddings[m.id] = await provider.embed(
          profileCorpus([
            m.goals,
            m.offers,
            m.needs,
            m.strengths,
            m.industries,
            [m.bio, m.headline, m.roleTitle],
          ]),
        );
      }
    }
  }

  const scored: ScoredAskMatch[] = [];
  const askRecordId = input.askId ?? askId();

  for (const target of members) {
    const raw = scoreAskPair(input.viewer, target, parsed, {
      askWeights: weights,
      indexWeights,
      embeddings:
        embeddings.__ask && embeddings[target.id]
          ? { ask: embeddings.__ask, target: embeddings[target.id] }
          : undefined,
    });
    let weighted = weighAsk(raw, weights);
    const fb = applyAskFeedback(
      weighted,
      input.viewer.id,
      target.id,
      askRecordId,
      input.feedback ?? [],
      input.indexFeedback ?? [],
    );
    if (fb.hidden || fb.declined) continue;
    weighted = fb.score;
    const cur = applyAskCuration(weighted, input.viewer.id, target.id, input.curation ?? []);
    if (cur.suppressed) continue;
    if (cur.score < ASK_SCORE_FLOOR && cur.source !== "human_curated") continue;
    scored.push(
      assembleAskMatch({
        viewer: input.viewer,
        target,
        askId: askRecordId,
        parsed,
        raw,
        weighted: cur.score,
        source: cur.source,
        curatedNote: cur.note,
        saved: fb.saved,
      }),
    );
  }

  scored.sort((a, b) => b.weighted - a.weighted);
  const asScored: ScoredMatch[] = scored.map((m) => ({
    viewerId: m.viewerId,
    target: m.target,
    raw: m.raw.meridianRaw,
    weighted: m.weighted,
    source: m.source,
    curatedNote: m.curatedNote,
    explanations: m.explanations,
    suppressed: false,
  }));
  const diversified = rerankForDiversity(asScored, Math.min(40, asScored.length));
  const order = new Map(diversified.map((m, i) => [m.target.id, i]));
  const people = [...scored]
    .sort((a, b) => (order.get(a.target.id) ?? 99) - (order.get(b.target.id) ?? 99))
    .map((m) =>
      m.source === "human_curated" && m.curatedNote
        ? {
            ...m,
            explanations: [
              { pillar: "Human curation", text: m.curatedNote },
              ...m.explanations.filter((e) => e.pillar !== "Human curation"),
            ].slice(0, 3),
          }
        : m,
    );

  const ask: HelpAskRecord = {
    id: askRecordId,
    viewerId: input.viewer.id,
    query: parsed.query,
    intents: parsed.intents,
    parsed,
    filters: parsed.filters,
    createdAt: new Date().toISOString(),
    isDemo: true,
  };

  return {
    ask,
    people,
    generatedAt: new Date().toISOString(),
    viewerId: input.viewer.id,
    weights,
    semantic,
    emptyQuery: false,
    openHouseIsolation,
  };
}

export async function getCachedAskIndex(
  input: AskServiceInput,
  cacheKey?: string,
): Promise<AskIndex> {
  const key = cacheKey ?? askCacheKey({
    viewerId: input.viewer.id,
    query: input.query,
    intents: input.intents,
    filters: input.filters,
  });
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = await computeAskIndex(input);
  cache.set(key, { at: Date.now(), value });
  return value;
}

export function invalidateAskCache(viewerId?: string) {
  if (!viewerId) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${viewerId}::`)) cache.delete(key);
  }
}

export async function demoAskIndexFor(
  overrides?: Partial<AskServiceInput>,
): Promise<AskIndex> {
  const store = getPreviewStore();
  const subject = overrides?.viewer ?? viewerProfile();
  return computeAskIndex({
    viewer: subject,
    members: store.profiles,
    askWeights: store.askWeights,
    indexWeights: store.weights,
    feedback: store.askFeedback,
    indexFeedback: store.feedback,
    curation: store.curation,
    blocks: store.crossings.blocks,
    standings: store.crossings.standings,
    useSemantic: true,
    isMemberAccess: true,
    ...overrides,
  });
}
