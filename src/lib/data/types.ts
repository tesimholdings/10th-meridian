export const APP_ROLES = [
  "guest",
  "applicant",
  "approved_unpaid",
  "member",
  "moderator",
  "administrator",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APPLICATION_STATUSES = [
  "started",
  "submitted",
  "under_review",
  "referred",
  "waitlisted",
  "approved_payment_pending",
  "active_member",
  "declined",
  "expired",
  "suspended",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type MembershipProduct = "lifetime" | "organization";

export type ConnectionPreference =
  | "peer"
  | "mentor"
  | "advisor"
  | "operator"
  | "investor"
  | "collaborator"
  | "host"
  | "guest";

export interface ProfileRecord {
  id: string;
  accountId: string;
  displayName: string;
  headline: string;
  roleTitle: string;
  company: string;
  city: string;
  country: string;
  timezone: string;
  bio: string;
  website?: string;
  linkedin?: string;
  industries: string[];
  interests: string[];
  values: string[];
  goals: string[];
  ambitions: string[];
  projects: string[];
  strengths: string[];
  offers: string[];
  needs: string[];
  valuedPeople: string[];
  valuedOpportunities: string[];
  preferredConnectionTypes: ConnectionPreference[];
  geography: string[];
  travel: string[];
  causes: string[];
  communicationStyle: string;
  availability: "open" | "selective" | "limited" | "paused";
  visibility: "members" | "matches_only" | "hidden";
  completion: number;
  isDemo: boolean;
  initials: string;
  accent: string;
}

export interface ApplicationRecord {
  id: string;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  phone?: string;
  city: string;
  country: string;
  timezone: string;
  roleTitle: string;
  company: string;
  bio: string;
  website?: string;
  linkedin?: string;
  industries: string[];
  interests: string[];
  goals: string[];
  strengths: string[];
  offers: string[];
  needs: string[];
  valuedPeople: string[];
  valuedOpportunities: string[];
  preferredConnectionTypes: ConnectionPreference[];
  referralCode?: string;
  discoverySource?: string;
  termsAgreed: boolean;
  cohortMonth: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralRecord {
  id: string;
  code: string;
  token: string;
  createdByName: string;
  label: string;
  maxUses: number;
  useCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  isDemo: boolean;
}

export interface EventRecord {
  id: string;
  title: string;
  kind: "dinner" | "salon" | "retreat" | "trip" | "member_hosted" | "open_house";
  summary: string;
  longDescription?: string;
  city: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registered: number;
  waitlist: number;
  channelSlug?: string;
  isDemo: boolean;
  paymentRequired: boolean;
  listingState: "planned" | "concept";
}

export interface ChannelRecord {
  id: string;
  slug: string;
  name: string;
  kind: "broadcast" | "public" | "private" | "event" | "dm" | "chapter";
  topic: string;
  unread: number;
  isDemo: boolean;
}

export interface MessageRecord {
  id: string;
  channelId: string;
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string;
  isDemo: boolean;
  threadCount?: number;
  parentId?: string;
  reactions?: Record<string, string[]>;
}

export interface MatchExplanation {
  pillar: string;
  text: string;
}

export interface MatchRecord {
  profileId: string;
  score: number;
  rank: number;
  source: "algorithmic" | "human_curated";
  curatedNote?: string;
  explanations: MatchExplanation[];
  complementary: string[];
}

export interface IntroRequest {
  id: string;
  fromId: string;
  targetId: string;
  fromName: string;
  toName: string;
  status: "requested" | "accepted" | "declined" | "completed";
  note?: string;
  isDemo: boolean;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
  isDemo: boolean;
}
