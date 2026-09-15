import { LIFETIME_PRICE_LABEL, SOLICITING_BAN } from "@/lib/copy/community";
import { brand } from "@/lib/config/site";
import type { CampaignSlot } from "@/lib/atmosphere/campaign";

/** Customer-facing Open House copy. Prose uses 10th Meridian; art may say TENTH MERIDIAN. */

export const OPEN_HOUSE_EYEBROW = "10TH MERIDIAN · PRIVATE NETWORK";
export const OPEN_HOUSE_HEADLINE = brand.idea;
export const OPEN_HOUSE_LEDE = "A private house for the next conversation that matters.";
export const OPEN_HOUSE_PROOF = "Ten new members a month · One lifetime membership";

export const EXPLORE_THE_HOUSE = "Explore the house";
export const JOIN_WAITLIST = "Join waitlist";
export const APPLY_LABEL = "Apply";
export const SIGN_IN_LABEL = "Sign in";

export const MEMBERSHIP_HEADLINE = `${LIFETIME_PRICE_LABEL}. Once.`;
export const MEMBERSHIP_NO_MONTHLY = "Monthly billing is not offered.";
export const MEMBERSHIP_CAP = brand.scarcity;
export const MEMBERSHIP_SOLICITING = `${SOLICITING_BAN} Removal for violations is without refund.`;

export const CLOSING_HEADLINE = "Make the next crossing count.";
export const FOOTER_PRIVATE = "Private by design.";
export const EXPERIENCES_DISCLOSURE =
  "Editorial imagery. Event details subject to confirmation.";
export const OPEN_HOUSE_MOMENT = "Open House moment";
export const EXPERIENCE_MOMENT = "Experience";
export const OPEN_HOUSE_EVENING = "Open House evening";

export const PUBLIC_NAV = [
  { href: "#the-house", pageHref: "/open-house#the-house", label: "The House" },
  { href: "#experiences", pageHref: "/open-house#experiences", label: "Experiences" },
  { href: "#membership", pageHref: "/open-house#membership", label: "Membership" },
  { href: "/sign-in", pageHref: "/sign-in", label: SIGN_IN_LABEL },
] as const;

export const HOUSE_BLOCKS = [
  {
    id: "people-first",
    title: "People first",
    body: "A private circle of who you should know next — never a public feed.",
    still: "homeIndex" as CampaignSlot,
  },
  {
    id: "when-paths-cross",
    title: "When paths cross",
    body: "Crossings when you land in the same city. City-level only.",
    still: "crossings" as CampaignSlot,
  },
  {
    id: "a-closed-table",
    title: "A closed table",
    body: "Ten new members a month. Lifetime membership, once.",
    still: "eventsDinner" as CampaignSlot,
  },
] as const;

export type ExperienceState = "planned" | "concept";

export interface OpenHouseExperience {
  id: string;
  title: string;
  place: string;
  state: ExperienceState;
  kind: "open_house" | "salon" | "trip";
  summary: string;
}

/** Seed listings only. Never presented as completed gatherings or real members. */
export const experiences: OpenHouseExperience[] = [
  {
    id: "open-house-evening-chicago",
    title: "Open House Evening",
    place: "Chicago",
    state: "planned",
    kind: "open_house",
    summary: "A planned threshold evening. Details to be confirmed.",
  },
  {
    id: "table-for-ten",
    title: "A table for ten",
    place: "Undisclosed",
    state: "planned",
    kind: "salon",
    summary: "A planned salon for ten. Venue undisclosed until confirmed.",
  },
  {
    id: "winter-field-walk",
    title: "Winter field walk",
    place: "",
    state: "concept",
    kind: "trip",
    summary: "A concept walk. Not scheduled.",
  },
];

export function experienceStateLabel(state: ExperienceState): "Planned" | "Concept" {
  return state === "concept" ? "Concept" : "Planned";
}

export const FORMAL_LOCKUP_SRC = "/brand/tenth-meridian-logo-full-lockup.png";
export const FORMAL_LOCKUP_WEBP = "/brand/tenth-meridian-logo-full-lockup.webp";
export const FORMAL_LOCKUP_KNOCKOUT_SRC = "/brand/tenth-meridian-logo-full-lockup-knockout.png";
export const FORMAL_LOCKUP_KNOCKOUT_WEBP = "/brand/tenth-meridian-logo-full-lockup-knockout.webp";
export const LIGHT_LOCKUP_SRC = "/brand/tenth-meridian-logo-light.svg";
export const MARK_SRC = "/brand/tenth-meridian-mark.svg";
