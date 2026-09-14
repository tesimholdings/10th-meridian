import { viewerDemoProfile } from "@/lib/data/demo";
import { parseAsk } from "@/lib/matching/ask/parse";
import type { AskFeedback, HelpAskRecord } from "@/lib/matching/ask/types";

/**
 * SYNTHETIC DEMO asks. Never treat these as real member needs.
 */
export const demoHelpAsks: HelpAskRecord[] = [
  {
    id: "ask-demo-fintech",
    viewerId: viewerDemoProfile.id,
    query: "I need counsel from someone who has opened a room in a new city",
    intents: ["advice", "ops"],
    parsed: parseAsk({
      query: "I need counsel from someone who has opened a room in a new city",
      intents: ["advice", "ops"],
    }),
    filters: {},
    createdAt: "2026-09-14T15:00:00.000Z",
    isDemo: true,
  },
  {
    id: "ask-demo-hiring",
    viewerId: viewerDemoProfile.id,
    query: "I need help hiring a discreet operator for a small brand",
    intents: ["hiring", "ops"],
    parsed: parseAsk({
      query: "I need help hiring a discreet operator for a small brand",
      intents: ["hiring", "ops"],
    }),
    filters: {},
    createdAt: "2026-09-14T15:10:00.000Z",
    isDemo: true,
  },
];

export const demoAskFeedback: AskFeedback[] = [];
