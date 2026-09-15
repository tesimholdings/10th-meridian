/** Concrete examples for every onboarding / apply field. */

export interface FieldGuide {
  label: string;
  placeholder: string;
  helper: string;
}

export const FIELD_GUIDES = {
  fullName: {
    label: "Name",
    placeholder: "Alex Rivera",
    helper: "The name you want the house to use — e.g. Alex Rivera.",
  },
  displayName: {
    label: "Name",
    placeholder: "Alex Rivera",
    helper: "How you appear to members — e.g. Alex Rivera.",
  },
  email: {
    label: "Email",
    placeholder: "alex@studio.com",
    helper: "A mailbox you actually read — e.g. alex@studio.com.",
  },
  phone: {
    label: "Phone (optional)",
    placeholder: "+1 512 555 0148",
    helper: "Optional. International format — e.g. +1 512 555 0148.",
  },
  city: {
    label: "City",
    placeholder: "Austin or Paris",
    helper: "A city name is enough — Austin or Paris.",
  },
  country: {
    label: "Country",
    placeholder: "United States or France",
    helper: "The country for that city — e.g. United States or France.",
  },
  timezone: {
    label: "Timezone",
    placeholder: "America/Chicago",
    helper: "IANA timezone — e.g. America/Chicago or Europe/Paris.",
  },
  roleTitle: {
    label: "Role / title",
    placeholder: "Founder, Operator",
    helper: "How you work — e.g. Founder, Operator.",
  },
  company: {
    label: "Company / house (optional)",
    placeholder: "Northline Studio",
    helper: "Optional. A studio, firm, or independent — e.g. Northline Studio.",
  },
  headline: {
    label: "Headline",
    placeholder: "Operator building quiet infrastructure",
    helper: "One line others see first — e.g. Operator building quiet infrastructure.",
  },
  bio: {
    label: "A short account of your work",
    placeholder: "I build durable systems for people who prefer substance to spectacle.",
    helper: "Two or three sentences. A sample: I build durable systems for people who prefer substance to spectacle.",
  },
  offers: {
    label: "What you can help with",
    placeholder: "Operator office hours, introductions in Chicago",
    helper: "Concrete help, not a pitch — e.g. Operator office hours, introductions in Chicago.",
  },
  needs: {
    label: "What you need",
    placeholder: "A thoughtful host in Lisbon, a peer who has scaled a studio",
    helper: "What would actually help — e.g. A thoughtful host in Lisbon.",
  },
  strengths: {
    label: "Strengths (optional)",
    placeholder: "Hiring, operating cadence",
    helper: "Optional. What people already ask you for — e.g. Hiring, operating cadence.",
  },
  industries: {
    label: "Industries (optional)",
    placeholder: "software, hospitality",
    helper: "Optional. A few words, comma-separated — e.g. software, hospitality.",
  },
  interests: {
    label: "Interests (optional)",
    placeholder: "long-form travel, architecture",
    helper: "Optional. What you talk about after dinner — e.g. long-form travel, architecture.",
  },
  goals: {
    label: "Goals (optional)",
    placeholder: "assemble a trusted operating circle",
    helper: "Optional. Near-term direction — e.g. assemble a trusted operating circle.",
  },
  referralCode: {
    label: "Referral code (optional)",
    placeholder: "TENTH-EARLY",
    helper: "Optional. If someone opened the door — e.g. TENTH-EARLY.",
  },
  discoverySource: {
    label: "How did you find the house?",
    placeholder: "A friend in Chicago, or the tenth",
    helper: "A short note — e.g. A friend in Chicago, or the tenth.",
  },
  intentOther: {
    label: "Other — in your words",
    placeholder: "I want a table in cities I already love",
    helper: "A short line is enough — e.g. I want a table in cities I already love.",
  },
} as const satisfies Record<string, FieldGuide>;

export type FieldGuideKey = keyof typeof FIELD_GUIDES;

export function fieldGuide(key: FieldGuideKey): FieldGuide {
  return FIELD_GUIDES[key];
}
