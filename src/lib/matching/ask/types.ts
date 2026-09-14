import type { ProfileRecord } from "@/lib/data/types";
import type { PairBreakdown, ScoredMatch } from "@/lib/matching/types";

export const ASK_INTENTS = [
  "capital",
  "hiring",
  "advice",
  "collaboration",
  "intro",
  "ops",
  "creative",
  "other",
] as const;

export type AskIntent = (typeof ASK_INTENTS)[number];

export const ASK_INTENT_LABELS: Record<AskIntent, string> = {
  capital: "Capital",
  hiring: "Hiring",
  advice: "Advice",
  collaboration: "Collaboration",
  intro: "Intro",
  ops: "Ops",
  creative: "Creative",
  other: "Other",
};

export interface AskFilters {
  location?: string;
  industry?: string;
  availability?: string;
  offer?: string;
  need?: string;
}

export interface ParsedAsk {
  empty: boolean;
  query: string;
  intents: AskIntent[];
  needs: string[];
  goals: string[];
  industries: string[];
  geography: string[];
  tokens: string[];
  filters: AskFilters;
}

/**
 * Ask the Meridian defaults — complementarity-first.
 * Their offers/strengths versus the stated need carry the most weight.
 * Existing Meridian Index compatibility is a real pillar, not a substitute.
 * Semantic / lexical is a supplement only.
 */
export interface AskMatchWeights {
  complementary: number;
  meridian: number;
  industry: number;
  geography: number;
  availability: number;
  semantic: number;
}

export const DEFAULT_ASK_WEIGHTS: AskMatchWeights = {
  complementary: 0.45,
  meridian: 0.2,
  industry: 0.12,
  geography: 0.1,
  availability: 0.08,
  semantic: 0.05,
};

export type AskFeedbackSignal = "relevant" | "not_relevant" | "hidden" | "saved";

export interface AskFeedback {
  askId: string;
  viewerId: string;
  targetId: string;
  signal: AskFeedbackSignal;
}

export interface AskBreakdown {
  complementary: number;
  meridian: number;
  industry: number;
  geography: number;
  availability: number;
  semantic: number;
  complementaryNotes: string[];
  industryNotes: string[];
  geographyNotes: string[];
  meridianRaw: PairBreakdown;
}

export interface ScoredAskMatch {
  viewerId: string;
  askId: string;
  target: ProfileRecord;
  raw: AskBreakdown;
  weighted: number;
  source: ScoredMatch["source"];
  curatedNote?: string;
  explanations: { pillar: string; text: string }[];
  saved: boolean;
}

export interface HelpAskRecord {
  id: string;
  viewerId: string;
  query: string;
  intents: AskIntent[];
  parsed: ParsedAsk;
  filters: AskFilters;
  createdAt: string;
  isDemo: boolean;
}

export interface AskIndex {
  ask: HelpAskRecord;
  people: ScoredAskMatch[];
  generatedAt: string;
  viewerId: string;
  weights: AskMatchWeights;
  semantic: boolean;
  emptyQuery: boolean;
  openHouseIsolation: boolean;
}

export const ASK_COPY = {
  name: "Ask the Meridian",
  subtitle: "Who can help",
  line: "Say what you need. We’ll show who can help.",
  support:
    "The Meridian Index: structured facets, complementarity, geography, availability, and a lexical supplement. Results are who can help — never a vague similarity list.",
  placeholder: "I need counsel from someone who has opened a room in a new city",
} as const;

export function memberProfilePath(id: string, from: "ask" | "index" = "ask") {
  return `/member/members/${id}?from=${from}`;
}

export function memberMessagePath(id: string) {
  return `/member/channels?dm=${encodeURIComponent(id)}`;
}
