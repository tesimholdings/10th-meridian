import type { AskFilters, AskIntent, ParsedAsk } from "@/lib/matching/ask/types";
import { ASK_INTENTS } from "@/lib/matching/ask/types";

const STOP = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "for",
  "from",
  "help",
  "i",
  "in",
  "into",
  "is",
  "it",
  "me",
  "my",
  "need",
  "needed",
  "of",
  "on",
  "or",
  "someone",
  "the",
  "to",
  "who",
  "with",
  "would",
  "looking",
  "find",
  "get",
  "want",
  "please",
]);

const INTENT_LEXICON: Record<Exclude<AskIntent, "other">, string[]> = {
  capital: [
    "capital",
    "investor",
    "investors",
    "funding",
    "fund",
    "raise",
    "raising",
    "series",
    "seed",
    "check",
    "lp",
    "vc",
    "angel",
    "venture",
    "diligence",
    "term-sheet",
    "term sheet",
  ],
  hiring: [
    "hiring",
    "hire",
    "recruit",
    "recruiter",
    "talent",
    "headcount",
    "engineer",
    "recruiting",
  ],
  advice: ["advice", "counsel", "mentor", "mentorship", "guidance", "board", "advisor"],
  collaboration: ["collaborate", "collaboration", "partner", "co-found", "together", "cofounder"],
  intro: ["intro", "introduction", "introduce", "introductions", "meet", "connect", "connection"],
  ops: ["ops", "operations", "operating", "systems", "process", "operator", "cadence"],
  creative: [
    "creative",
    "film",
    "design",
    "brand",
    "writer",
    "culture",
    "salon",
    "art",
    "editorial",
  ],
};

const INDUSTRY_ALIASES: Record<string, string[]> = {
  fintech: ["fintech", "financial technology"],
  finance: ["finance", "financial", "capital markets"],
  venture: ["venture", "vc", "series a", "series b", "seed"],
  climate: ["climate"],
  hospitality: ["hospitality", "hotel", "restaurant", "dining"],
  media: ["media", "film", "editorial", "publishing"],
  design: ["design", "brand", "typography"],
  hardware: ["hardware", "manufacturing"],
  culture: ["culture", "fashion", "salon"],
  sport: ["sport", "athlete", "outdoors"],
  travel: ["travel", "explorer", "expedition"],
  technology: ["technology", "software", "tech"],
  software: ["software"],
  philanthropy: ["philanthropy"],
  "family office": ["family office"],
  food: ["food", "kitchen", "wine"],
  talent: ["talent", "hiring", "recruiting"],
};

const GEO_ALIASES: Record<string, string[]> = {
  "New York": ["nyc", "new york", "manhattan", "brooklyn"],
  Chicago: ["chicago", "chi"],
  London: ["london"],
  Paris: ["paris"],
  Lagos: ["lagos"],
  Lisbon: ["lisbon"],
  "Mexico City": ["mexico city", "cdmx", "mexico"],
  Singapore: ["singapore"],
  Tokyo: ["tokyo"],
  Denver: ["denver"],
  Mumbai: ["mumbai"],
  Austin: ["austin"],
  Kyoto: ["kyoto"],
  Stockholm: ["stockholm"],
  Edinburgh: ["edinburgh"],
  "United States": ["usa", "united states", "us"],
};

const PHRASES = [
  "series a",
  "series b",
  "first check",
  "term sheet",
  "family office",
  "private dinner",
  "office hours",
];

export function tokenizeAsk(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function hasAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n));
}

function detectIntents(hay: string, explicit: AskIntent[]): AskIntent[] {
  const found = new Set<AskIntent>(explicit);
  for (const intent of ASK_INTENTS) {
    if (intent === "other") continue;
    if (hasAny(hay, INTENT_LEXICON[intent])) found.add(intent);
  }
  if (found.size === 0 && hay.trim()) found.add("other");
  return ASK_INTENTS.filter((i) => found.has(i));
}

function detectIndustries(hay: string): string[] {
  const hits: string[] = [];
  for (const [canon, aliases] of Object.entries(INDUSTRY_ALIASES)) {
    if (hasAny(hay, aliases) || hay.includes(canon)) hits.push(canon);
  }
  return hits;
}

function detectGeography(hay: string): string[] {
  const hits: string[] = [];
  for (const [canon, aliases] of Object.entries(GEO_ALIASES)) {
    if (hasAny(hay, aliases) || hay.includes(canon.toLowerCase())) hits.push(canon);
  }
  return hits;
}

function detectPhrases(hay: string): string[] {
  return PHRASES.filter((p) => hay.includes(p));
}

function filterActive(filters: AskFilters): boolean {
  return Boolean(
    filters.location?.trim() ||
      filters.industry?.trim() ||
      filters.availability?.trim() ||
      filters.offer?.trim() ||
      filters.need?.trim(),
  );
}

export function parseAsk(input: {
  query?: string;
  intents?: AskIntent[];
  filters?: AskFilters;
}): ParsedAsk {
  const query = (input.query ?? "").replace(/\s+/g, " ").trim();
  const filters: AskFilters = {
    location: input.filters?.location?.trim() || undefined,
    industry: input.filters?.industry?.trim() || undefined,
    availability: input.filters?.availability?.trim() || undefined,
    offer: input.filters?.offer?.trim() || undefined,
    need: input.filters?.need?.trim() || undefined,
  };
  const explicit = (input.intents ?? []).filter((i): i is AskIntent =>
    (ASK_INTENTS as readonly string[]).includes(i),
  );
  const empty = query.length === 0 && explicit.length === 0 && !filterActive(filters);
  if (empty) {
    return {
      empty: true,
      query: "",
      intents: [],
      needs: [],
      goals: [],
      industries: [],
      geography: [],
      tokens: [],
      filters,
    };
  }

  const hay = [
    query.toLowerCase(),
    explicit.join(" "),
    filters.location ?? "",
    filters.industry ?? "",
    filters.need ?? "",
    filters.offer ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const tokens = tokenizeAsk([query, filters.need, filters.offer, filters.industry].filter(Boolean).join(" "));
  const phrases = detectPhrases(hay);
  const intents = detectIntents(hay, explicit);
  const industries = unique([
    ...detectIndustries(hay),
    ...(filters.industry ? [filters.industry] : []),
  ]);
  const geography = unique([
    ...detectGeography(hay),
    ...(filters.location ? [filters.location] : []),
  ]);

  const needs = unique([
    ...phrases,
    ...tokens.filter((t) => !["intro", "introduction"].includes(t)),
    ...(filters.need ? tokenizeAsk(filters.need) : []),
    ...intents.map((i) => ASK_NEED_FOR_INTENT[i]),
  ]);

  const goals = unique([...phrases, ...intents.map((i) => ASK_GOAL_FOR_INTENT[i])]);

  return {
    empty: false,
    query,
    intents,
    needs,
    goals,
    industries,
    geography,
    tokens: unique([...tokens, ...phrases]),
    filters,
  };
}

const ASK_NEED_FOR_INTENT: Record<AskIntent, string> = {
  capital: "patient capital conversation",
  hiring: "hiring",
  advice: "counsel",
  collaboration: "collaboration",
  intro: "introductions",
  ops: "operator",
  creative: "creative",
  other: "help",
};

const ASK_GOAL_FOR_INTENT: Record<AskIntent, string> = {
  capital: "raise",
  hiring: "assemble a team",
  advice: "advice",
  collaboration: "partner",
  intro: "introduction",
  ops: "operating cadence",
  creative: "culture",
  other: "help",
};

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}
