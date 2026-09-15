/** Why-you're-here intents. Multi-select plus an Other line. */

export const INTENT_OTHER_ID = "other" as const;

export const JOIN_INTENTS = [
  {
    id: "travel-crossings",
    label: "Travel more / Crossings",
    hint: "Know when paths meet in the same city.",
  },
  {
    id: "mentor",
    label: "Mentor others",
    hint: "Offer time to people a few steps behind.",
  },
  {
    id: "learn",
    label: "Learn from people ahead of me",
    hint: "Ask well. Listen first.",
  },
  {
    id: "grow-business",
    label: "Grow my business",
    hint: "Operators and peers — not a pitch room.",
  },
  {
    id: "meet-friends",
    label: "Meet friends",
    hint: "The next dinner, not a funnel.",
  },
  {
    id: "cofounders",
    label: "Find co-founders / operators",
    hint: "People you would actually build with.",
  },
  {
    id: "capital",
    label: "Raise or deploy capital",
    hint: "Tasteful. Never a solicitation.",
  },
  {
    id: "host-table",
    label: "Host dinners / Open a Table",
    hint: "A closed table, when the room is ready.",
  },
  {
    id: "discover-cities",
    label: "Discover cities with trusted people",
    hint: "Land somewhere you already have a name.",
  },
  {
    id: INTENT_OTHER_ID,
    label: "Other",
    hint: "Say it in a line.",
  },
] as const;

export type JoinIntentId = (typeof JOIN_INTENTS)[number]["id"];

export function isJoinIntentId(value: string): value is JoinIntentId {
  return JOIN_INTENTS.some((intent) => intent.id === value);
}

export function toggleIntent(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  return [...selected, id];
}

export function normalizeIntents(selected: string[], other = ""): {
  intents: JoinIntentId[];
  intentOther: string;
} {
  const unique = [...new Set(selected.map((item) => item.trim()).filter(Boolean))];
  const intents = unique.filter(isJoinIntentId);
  const intentOther = other.trim().slice(0, 280);
  return { intents, intentOther };
}

export function intentsAreComplete(selected: string[], other = ""): boolean {
  const { intents, intentOther } = normalizeIntents(selected, other);
  if (intents.length === 0) return false;
  if (intents.includes(INTENT_OTHER_ID) && intentOther.length < 2) return false;
  return true;
}

export function intentLabels(selected: string[], other = ""): string[] {
  const { intents, intentOther } = normalizeIntents(selected, other);
  return intents.map((id) => {
    const row = JOIN_INTENTS.find((intent) => intent.id === id);
    if (id === INTENT_OTHER_ID && intentOther) return `Other — ${intentOther}`;
    return row?.label ?? id;
  });
}
