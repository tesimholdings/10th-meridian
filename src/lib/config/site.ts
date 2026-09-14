/** Planned production origin. Not purchased; do not attach in Vercel yet. */
export const plannedProductionUrl = "https://tenmeridian.com";

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
  houseHours:
    "Open House is the tenth, 10:00–22:00 in your local time. Referral holders may enter from 9:00 in that same local time.",
  soliciting:
    "Absolutely no soliciting. A ban is permanent and without refund. Members may refer people. You may mention yourself only when someone is asking.",
} as const;

export const publicNav = [
  { href: "/sign-in", label: "Member Sign In" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
] as const;

export const memberNav = [
  { href: "/member/home", label: "Home", id: "home" },
  { href: "/member/index", label: "Index", id: "index" },
  { href: "/member/channels", label: "Channels", id: "channels" },
  { href: "/member/members", label: "Members", id: "members" },
  { href: "/member/profile", label: "Profile", id: "profile" },
] as const;

export const memberSecondary = [
  { href: "/member/crossings", label: "Crossings" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/member/events", label: "Events" },
  { href: "/member/billing", label: "Billing" },
  { href: "/member/resources", label: "Resources" },
  { href: "/member/settings", label: "Settings" },
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
