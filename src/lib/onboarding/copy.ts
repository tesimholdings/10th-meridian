import { brand } from "@/lib/config/site";
import { LIFETIME_PRICE_LABEL, SOLICITING_BAN } from "@/lib/copy/community";
import type { CampaignSlot } from "@/lib/atmosphere/campaign";

export type ExperienceMode = "apply" | "member";
export type ExperienceVariant = "cinematic" | "compact";

export const EXPERIENCE_CHAPTERS = [
  { id: "welcome", title: "Welcome", still: "heroLandscape" as CampaignSlot },
  { id: "intents", title: "Why you’re here", still: "crossings" as CampaignSlot },
  { id: "identity", title: "Who you are", still: "homeIndex" as CampaignSlot },
  { id: "socials", title: "Connect", still: "homeNetwork" as CampaignSlot },
  { id: "exchange", title: "Offer & need", still: "eventsDinner" as CampaignSlot },
  { id: "review", title: "Threshold", still: "celebrations" as CampaignSlot },
] as const;

export type ExperienceChapterId = (typeof EXPERIENCE_CHAPTERS)[number]["id"];

export const EXPERIENCE_PROMISE = brand.idea;
export const EXPERIENCE_EDITORIAL =
  "Editorial still — not a photograph of members or a completed gathering.";

export const APPLY_WELCOME = {
  eyebrow: "10TH MERIDIAN · APPLICATION",
  title: EXPERIENCE_PROMISE,
  lede: "An application is an evening, not a form letter. Tell the house who you are. Selection stays human.",
  facts: `${LIFETIME_PRICE_LABEL} lifetime. No more than ten new members each month. Monthly billing is not offered.`,
} as const;

export const MEMBER_WELCOME = {
  eyebrow: "10TH MERIDIAN · AFTER THE THRESHOLD",
  title: "The house already has your name.",
  lede: "Finish the portrait so the next conversation can find you. This preview writes to DEMO profile state.",
  facts: "Matching is recalculated after meaningful changes. Completeness is the difference between a faint signal and a precise one.",
} as const;

export const INTENT_LEDE =
  "Why this house, now. Choose every line that is true. The room is not a marketplace.";

export const INTENT_SOLICITING = `${SOLICITING_BAN} Referrals are welcome. Mention yourself only if asked.`;

export const SOCIAL_LEDE =
  "One tap to link the rooms you already keep. Primary four first; the rest are optional.";

export const EXCHANGE_LEDE =
  "What you can quietly offer. What you actually need. Write as a person, not a pitch.";

export const REVIEW_APPLY_CTA = "Submit application";
export const REVIEW_MEMBER_CTA = "Continue into the house";
export const REVIEW_APPLY_DONE =
  "Received, and in human hands. Selection is discretionary. A referral is not a promise.";
export const REVIEW_MEMBER_DONE = "Portrait saved. Welcome through.";

export function welcomeCopy(mode: ExperienceMode) {
  return mode === "apply" ? APPLY_WELCOME : MEMBER_WELCOME;
}

export function chapterTitle(index: number): string {
  return EXPERIENCE_CHAPTERS[index]?.title ?? "";
}
