import type { ProfileRecord } from "@/lib/data/types";

export interface MatchingWeights {
  complementary: number;
  goals: number;
  interests: number;
  industry: number;
  geography: number;
  preferences: number;
  novelty: number;
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  complementary: 0.3,
  goals: 0.25,
  interests: 0.15,
  industry: 0.1,
  geography: 0.05,
  preferences: 0.05,
  novelty: 0.1,
};

export interface MatchFeedback {
  viewerId: string;
  targetId: string;
  signal: "relevant" | "not_relevant" | "declined" | "hidden" | "accepted" | "introduced";
}

export interface MatchCuration {
  viewerId: string;
  targetId: string;
  action: "promote" | "suppress";
  reason: string;
}

export interface BlockRecord {
  a: string;
  b: string;
}

export interface PairBreakdown {
  complementary: number;
  goals: number;
  interests: number;
  industry: number;
  geography: number;
  preferences: number;
  novelty: number;
  complementaryNotes: string[];
  goalNotes: string[];
  interestNotes: string[];
}

export interface ScoredMatch {
  viewerId: string;
  target: ProfileRecord;
  raw: PairBreakdown;
  weighted: number;
  source: "algorithmic" | "human_curated";
  curatedNote?: string;
  explanations: { pillar: string; text: string }[];
  suppressed: boolean;
}

export const PROTECTED_TRAIT_BAN = [
  "race",
  "ethnicity",
  "religion",
  "health",
  "disability",
  "sexual orientation",
  "gender identity",
  "pregnancy",
  "age",
  "national origin as a ranking factor",
] as const;
