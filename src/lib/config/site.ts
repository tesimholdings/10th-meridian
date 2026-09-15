import { PREPARED_DOMAIN } from "@/lib/copy/community";
import {
  NAV_CROSSINGS,
  NAV_HOME,
  NAV_INDEX,
  NAV_MESSAGES,
  NAV_PROFILE,
  YOUR_CIRCLE,
} from "@/lib/copy/ui";

export const brand = {
  name: "10th Meridian",
  shortName: "10°M",
  idea: "The people you should know next.",
  positioning:
    "A private network built around relevance, trust, contribution, and the belief that the right relationship can change everything.",
  lockLine: "The doors open on the tenth.",
  scarcity:
    "No more than ten new members are hand-selected each month.",
  referralTone:
    "A referral opens the door earlier. What happens next is still earned.",
  matchingLine:
    "Intelligence finds the signal. People decide what happens next.",
  crossingsLine: "The people you should know, wherever you land.",
  crossingsSupport: "When your paths cross, you’ll know.",
  meridian10:
    "Ten people. Chosen for where you are—and where you are going.",
  meridian100:
    "A wider field of relevance — ranked, never invented.",
  askLine: "Ask the Meridian. Who can help — and who you should know next.",
  circleLine: "Your Circle is chosen by you. The Index is suggested. Introductions are human.",
  solicitingLine: "Absolutely no soliciting. Ban with no refund.",
  preparedDomain: PREPARED_DOMAIN,
} as const;

export const publicNav = [
  { href: "/sign-in", label: "Member Sign In" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
] as const;

export const memberNav = [
  { href: "/member/home", label: NAV_HOME, id: "home" },
  { href: "/member/index", label: NAV_INDEX, id: "index" },
  { href: "/member/messages", label: NAV_MESSAGES, id: "messages" },
  { href: "/member/crossings", label: NAV_CROSSINGS, id: "crossings" },
  { href: "/member/profile", label: NAV_PROFILE, id: "profile" },
] as const;

export const memberSecondary = [
  { href: "/member/notifications", label: "Notifications" },
  { href: "/member/index?tab=circle", label: YOUR_CIRCLE },
  { href: "/member/events", label: "Events" },
  { href: "/member/settings", label: "Account settings" },
  { href: "/member/settings#billing", label: "Billing" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/member/resources", label: "Resources" },
] as const;

export const seedChannels = [
  { slug: "announcements", name: "Announcements", kind: "broadcast" },
  { slug: "introductions", name: "Introductions", kind: "public" },
  { slug: "ask-and-offer", name: "Ask & Offer", kind: "public" },
  { slug: "opportunities", name: "Opportunities", kind: "public" },
  { slug: "events", name: "Events", kind: "public" },
  { slug: "travel", name: "Travel", kind: "public" },
  { slug: "ideas", name: "Ideas", kind: "public" },
] as const;

export const defaultMatchingWeights = {
  complementary: 0.3,
  goals: 0.25,
  interests: 0.15,
  industry: 0.1,
  geography: 0.05,
  preferences: 0.05,
  novelty: 0.1,
} as const;
