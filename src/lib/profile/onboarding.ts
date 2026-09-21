import { pathAfterPasswordLogin } from "@/lib/auth/members";
import type { AppRole, ConnectionPreference, ProfileRecord } from "@/lib/data/types";
import { DEFAULT_PROFILE_PRIVACY } from "@/lib/network/types";
import { profileCompletion } from "@/lib/profile/completion";

/** Preview session that should see the builder. Not a real member id. */
export const FRESH_PREVIEW_ACCOUNT_ID = "preview-new-member";

export const MEMBER_INTENTS = [
  {
    id: "travel",
    label: "Travel more",
    example: "A host in Lisbon, a table in Mexico City.",
  },
  {
    id: "mentor",
    label: "Mentor",
    example: "Offer judgment to someone earlier in the work.",
  },
  {
    id: "learn",
    label: "Learn",
    example: "Find people who have already built what you are starting.",
  },
  {
    id: "grow_business",
    label: "Grow a business",
    example: "Operators, customers, and a sharper offer.",
  },
  {
    id: "meet_friends",
    label: "Meet friends",
    example: "People you would actually have dinner with.",
  },
  {
    id: "collaborate",
    label: "Collaborate",
    example: "A project that needs more than one house.",
  },
  {
    id: "host",
    label: "Host or be hosted",
    example: "Open a room, or be welcomed into one.",
  },
  {
    id: "give_back",
    label: "Give back",
    example: "Time, capital, or a door you can open.",
  },
] as const;

export type MemberIntentId = (typeof MEMBER_INTENTS)[number]["id"];

export const SOCIAL_NETWORKS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/in/your-name",
    example: "linkedin.com/in/your-name or @your-name",
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://www.instagram.com/your-name",
    example: "instagram.com/your-name or @your-name",
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://www.facebook.com/your-name",
    example: "facebook.com/your-name",
  },
  {
    id: "x",
    label: "X",
    placeholder: "https://x.com/your-name",
    example: "x.com/your-name or @your-name",
  },
] as const;

export type SocialNetworkId = (typeof SOCIAL_NETWORKS)[number]["id"];

export type SocialLink = { label: string; url: string };

export type OnboardingDraft = {
  linkedin: string;
  instagram: string;
  facebook: string;
  x: string;
  others: SocialLink[];
  knownFor: string;
  aboutNow: string;
  basedIn: string;
  bio: string;
  interests: string;
  intents: string[];
  intentNote: string;
};

export type OnboardingStatus = "pending" | "skipped" | "completed";

export type OnboardingCookie = {
  accountId: string;
  status: OnboardingStatus;
};

export type OnboardingDbState = OnboardingStatus | "unknown";

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = {
  linkedin: "",
  instagram: "",
  facebook: "",
  x: "",
  others: [],
  knownFor: "",
  aboutNow: "",
  basedIn: "",
  bio: "",
  interests: "",
  intents: [],
  intentNote: "",
};

const INTENT_CONNECTIONS: Partial<Record<MemberIntentId, ConnectionPreference>> = {
  mentor: "mentor",
  learn: "advisor",
  grow_business: "operator",
  collaborate: "collaborator",
  host: "host",
  meet_friends: "peer",
  travel: "guest",
  give_back: "advisor",
};

const HANDLE = /^[A-Za-z0-9._-]{1,64}$/;

export function isMemberIntent(value: string): value is MemberIntentId {
  return MEMBER_INTENTS.some((intent) => intent.id === value);
}

export function intentLabel(id: string): string {
  return MEMBER_INTENTS.find((intent) => intent.id === id)?.label ?? id;
}

export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    ...EMPTY_ONBOARDING_DRAFT,
    others: [],
    intents: [],
  };
}

export function parseOnboardingCookie(raw: string | null | undefined): OnboardingCookie | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as { accountId?: unknown; status?: unknown };
    if (typeof value.accountId !== "string" || !value.accountId) return null;
    if (value.status !== "pending" && value.status !== "skipped" && value.status !== "completed") {
      return null;
    }
    return { accountId: value.accountId, status: value.status };
  } catch {
    return null;
  }
}

export function encodeOnboardingCookie(cookie: OnboardingCookie): string {
  return JSON.stringify({ accountId: cookie.accountId, status: cookie.status });
}

/**
 * Fresh members are prompted once. Skip and complete both settle the account.
 * Demo sessions stay quiet unless this browser was explicitly marked pending.
 * Stewards and unpaid guests are not forced through the builder.
 */
export function shouldPromptOnboarding(input: {
  role: AppRole | null;
  accountId: string | null;
  cookie: OnboardingCookie | null;
  db: OnboardingDbState;
  isDemo: boolean;
}): boolean {
  if (input.role !== "member" || !input.accountId) return false;
  const cookie =
    input.cookie && input.cookie.accountId === input.accountId ? input.cookie.status : null;
  if (cookie === "skipped" || cookie === "completed") return false;
  if (cookie === "pending") return true;
  if (input.db === "skipped" || input.db === "completed") return false;
  if (input.db === "pending" && !input.isDemo) return true;
  return false;
}

/** After a confirmed payment, a still-unsettled profile goes to the builder. */
export function shouldOfferOnboardingAfterPayment(input: {
  accountId: string | null;
  cookie: OnboardingCookie | null;
  db: OnboardingDbState;
}): boolean {
  if (!input.accountId) return false;
  const cookie =
    input.cookie && input.cookie.accountId === input.accountId ? input.cookie.status : null;
  if (cookie === "skipped" || cookie === "completed") return false;
  if (cookie === "pending") return true;
  return input.db === "pending";
}

export function nextOnboardingStatus(
  previous: OnboardingStatus | "unknown" | null,
  action: "save" | "skip" | "complete",
): OnboardingStatus {
  if (action === "skip") return "skipped";
  if (action === "complete") return "completed";
  if (previous === "skipped" || previous === "completed") return previous;
  return "pending";
}

export function pathAfterMemberEnter(role: AppRole, promptProfile: boolean): string {
  if (promptProfile && role === "member") return "/onboarding";
  return pathAfterPasswordLogin(role);
}

export function normalizeSocialInput(
  network: SocialNetworkId | "other",
  raw: string,
): { ok: true; url: string } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, url: "" };

  const direct = asHttpUrl(trimmed);
  if (direct) return { ok: true, url: direct };

  if (network === "other") {
    return { ok: false, message: "Use a full https link." };
  }

  const handle = trimmed.replace(/^@/, "");
  if (!HANDLE.test(handle)) {
    return { ok: false, message: "Use a profile link or a handle like @your-name." };
  }

  const bases: Record<SocialNetworkId, string> = {
    linkedin: "https://www.linkedin.com/in/",
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    x: "https://x.com/",
  };
  return { ok: true, url: `${bases[network]}${handle}` };
}

function asHttpUrl(raw: string): string | null {
  const withScheme = /^https?:\/\//i.test(raw)
    ? raw
    : /^[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(raw)
      ? `https://${raw}`
      : "";
  if (!withScheme) return null;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeOnboardingDraft(input: OnboardingDraft): {
  draft: OnboardingDraft;
  errors: string[];
} {
  const errors: string[] = [];
  const socials = {
    linkedin: normalizeSocialInput("linkedin", input.linkedin),
    instagram: normalizeSocialInput("instagram", input.instagram),
    facebook: normalizeSocialInput("facebook", input.facebook),
    x: normalizeSocialInput("x", input.x),
  };
  for (const [name, result] of Object.entries(socials)) {
    if (!result.ok) errors.push(`${name}: ${result.message}`);
  }

  const others: SocialLink[] = [];
  for (const row of input.others.slice(0, 4)) {
    const label = row.label.trim().slice(0, 40);
    const url = normalizeSocialInput("other", row.url);
    if (!label && !row.url.trim()) continue;
    if (!label) {
      errors.push("Name the other social before linking it.");
      continue;
    }
    if (!url.ok) {
      errors.push(`${label}: ${url.message}`);
      continue;
    }
    if (!url.url) continue;
    others.push({ label, url: url.url });
  }

  return {
    draft: {
      linkedin: socials.linkedin.ok ? socials.linkedin.url : input.linkedin.trim(),
      instagram: socials.instagram.ok ? socials.instagram.url : input.instagram.trim(),
      facebook: socials.facebook.ok ? socials.facebook.url : input.facebook.trim(),
      x: socials.x.ok ? socials.x.url : input.x.trim(),
      others,
      knownFor: input.knownFor.trim().slice(0, 180),
      aboutNow: input.aboutNow.trim().slice(0, 280),
      basedIn: input.basedIn.trim().slice(0, 120),
      bio: input.bio.trim().slice(0, 1200),
      interests: input.interests.trim().slice(0, 400),
      intents: [...new Set(input.intents.filter(isMemberIntent))],
      intentNote: input.intentNote.trim().slice(0, 600),
    },
    errors,
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/** Structured fields matching can read later, plus the free-text note. */
export function projectOnboarding(
  existing: ProfileRecord | null,
  draft: OnboardingDraft,
): Partial<ProfileRecord> {
  const intents = draft.intents.filter(isMemberIntent);
  const note = draft.intentNote.trim();
  const labels = intents.map((id) => intentLabel(id));
  const connections = intents
    .map((id) => INTENT_CONNECTIONS[id])
    .filter((value): value is ConnectionPreference => Boolean(value));

  return {
    headline: draft.knownFor.trim() || existing?.headline || "",
    bio: draft.bio.trim() || existing?.bio || "",
    city: draft.basedIn.trim() || existing?.city || "",
    aboutNow: draft.aboutNow.trim(),
    roleTitle: existing?.roleTitle || draft.aboutNow.trim() || "",
    linkedin: draft.linkedin || existing?.linkedin,
    instagram: draft.instagram || undefined,
    facebook: draft.facebook || undefined,
    x: draft.x || undefined,
    socialLinks: draft.others,
    intents,
    intentNote: note,
    goals: unique([...(existing?.goals ?? []), ...labels, ...(note ? [note] : [])]),
    interests: unique([...(existing?.interests ?? []), ...splitList(draft.interests)]),
    preferredConnectionTypes: unique([
      ...(existing?.preferredConnectionTypes ?? []),
      ...connections,
    ]) as ConnectionPreference[],
  };
}

export function blankMemberProfile(name: string, accountId: string): ProfileRecord {
  const initials =
    name
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NM";
  return {
    id: accountId,
    accountId,
    displayName: name || "New member",
    headline: "",
    roleTitle: "",
    company: "",
    city: "",
    country: "",
    timezone: "",
    bio: "",
    gallery: [],
    privacy: { ...DEFAULT_PROFILE_PRIVACY },
    attendingEventIds: [],
    industries: [],
    interests: [],
    values: [],
    goals: [],
    ambitions: [],
    projects: [],
    strengths: [],
    offers: [],
    needs: [],
    valuedPeople: [],
    valuedOpportunities: [],
    preferredConnectionTypes: [],
    geography: [],
    travel: [],
    causes: [],
    communicationStyle: "",
    availability: "selective",
    visibility: "members",
    completion: 0,
    isDemo: true,
    initials,
    accent: "#1a3a44",
  };
}

export function profileFromOnboarding(input: {
  viewer: ProfileRecord;
  accountId: string;
  name: string;
  draft: OnboardingDraft | null;
}): ProfileRecord {
  const ownsSeed = input.accountId === input.viewer.id;
  if (!input.draft) {
    if (!ownsSeed) {
      return { ...blankMemberProfile(input.name, input.accountId), isDemo: false };
    }
    return input.viewer;
  }
  const base = ownsSeed ? input.viewer : blankMemberProfile(input.name, input.accountId);
  const next: ProfileRecord = { ...base, ...projectOnboarding(base, input.draft) };
  if (!ownsSeed && input.accountId !== FRESH_PREVIEW_ACCOUNT_ID) next.isDemo = false;
  next.completion = profileCompletion(next);
  return next;
}

export function draftHasAnswers(draft: OnboardingDraft | null): boolean {
  if (!draft) return false;
  return Boolean(
    draft.linkedin ||
      draft.instagram ||
      draft.facebook ||
      draft.x ||
      draft.others.length ||
      draft.knownFor ||
      draft.aboutNow ||
      draft.basedIn ||
      draft.bio ||
      draft.interests ||
      draft.intents.length ||
      draft.intentNote,
  );
}
