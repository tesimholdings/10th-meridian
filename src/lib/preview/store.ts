import {
  demoAnnouncements,
  demoApplications,
  demoAudit,
  demoChannelMembers,
  demoChannels,
  demoCircle,
  demoEvents,
  demoHouseNotifications,
  demoIntros,
  demoMessages,
  demoProfiles,
  demoReferrals,
  viewerDemoProfile,
} from "@/lib/data/demo";
import {
  demoCityHosts,
  demoCityNotes,
  demoCrossingRequests,
  demoGroupTables,
  demoJourneys,
  demoTravelNotifications,
  demoTravelPrefs,
} from "@/lib/data/crossings-demo";
import type { CrossingsState } from "@/lib/crossings/service";
import { DEFAULT_TRAVEL_WEIGHTS } from "@/lib/crossings/types";
import type {
  ApplicationRecord,
  ApplicationStatus,
  AuditEvent,
  ChannelRecord,
  EventRecord,
  IntroRequest,
  MessageRecord,
  ProfileRecord,
  ReferralRecord,
} from "@/lib/data/types";
import type { OpenHouseConfig } from "@/lib/access/open-house";
import { env } from "@/lib/env";
import type { MatchCuration, MatchFeedback, MatchingWeights } from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";
import { profileCompletion } from "@/lib/profile/completion";
import type { OnboardingDraft, OnboardingStatus } from "@/lib/profile/onboarding";
import {
  addToCircle,
  removeFromCircle,
  removeFromIndex,
  restoreToIndex,
} from "@/lib/network/circle";
import type {
  CircleEdge,
  HouseNotification,
  HouseNotificationPrefs,
  IndexRemoval,
} from "@/lib/network/types";
import { DEFAULT_HOUSE_NOTIFICATION_PREFS } from "@/lib/network/types";
import { stubGalleryUpload, type GalleryUpload } from "@/lib/storage/gallery";
import { seedRewardsState } from "@/lib/data/rewards-demo";
import {
  advanceRedemption,
  advanceReferral,
  cancelReservation,
  creditReferrerForAdmittedApplication,
  requestRedemption,
  reserveReward,
  submitReferral,
  withdrawReferral,
} from "@/lib/rewards/actions";
import { memberReferralCode, memberReferralToken } from "@/lib/rewards/identity";
import { buildRewardsSnapshot } from "@/lib/rewards/snapshot";
import type { RewardsState } from "@/lib/rewards/types";

export type MembershipProductKind = "founding" | "standard";
export type PaidMembershipStatus = "active" | "canceled" | "past_due";

export type PaidMembershipRecord = {
  accountId: string;
  email?: string;
  applicationId?: string;
  product: MembershipProductKind;
  status: PaidMembershipStatus;
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  eventId: string;
  source: "checkout" | "invoice" | "subscription";
  paidAt: string;
  canceledAt?: string;
  isDemo: boolean;
};

export interface PreviewState {
  weights: MatchingWeights;
  openHouse: OpenHouseConfig;
  admissionsCap: number;
  cohortMonth: string;
  profiles: ProfileRecord[];
  viewerId: string;
  applications: ApplicationRecord[];
  referrals: ReferralRecord[];
  paidMemberships: PaidMembershipRecord[];
  feedback: MatchFeedback[];
  curation: MatchCuration[];
  intros: IntroRequest[];
  events: EventRecord[];
  eventRegs: { eventId: string; accountId: string; status: "registered" | "waitlist" }[];
  channels: ChannelRecord[];
  messages: MessageRecord[];
  readChannels: string[];
  audit: AuditEvent[];
  announcements: typeof demoAnnouncements;
  crossings: CrossingsState;
  circle: CircleEdge[];
  indexRemovals: IndexRemoval[];
  houseNotifications: HouseNotification[];
  houseNotificationPrefs: HouseNotificationPrefs[];
  channelMembers: Record<string, string[]>;
  rewards: RewardsState;
  onboardingByAccount: Record<string, StoredOnboarding>;
}

export type StoredOnboarding = {
  draft: OnboardingDraft;
  status: OnboardingStatus;
  updatedAt: string;
};

function seed(): PreviewState {
  return {
    weights: { ...DEFAULT_WEIGHTS },
    openHouse: {
      timeZone: env.openHouseTimezone,
      day: env.openHouseDay,
      referralHour: env.openHouseReferralHour,
      generalHour: env.openHouseGeneralHour,
      closeHour: env.openHouseCloseHour,
      force: env.openHouseForce,
    },
    admissionsCap: env.admissionsCap,
    cohortMonth: "2026-10",
    profiles: structuredClone(demoProfiles),
    viewerId: viewerDemoProfile.id,
    applications: structuredClone(demoApplications),
    paidMemberships: [],
    referrals: [
      ...structuredClone(demoReferrals),
      {
        id: "ref-member-demo-01",
        code: memberReferralCode(viewerDemoProfile),
        token: memberReferralToken(viewerDemoProfile.id),
        createdByName: viewerDemoProfile.displayName,
        label: "Member referral — A. Voss",
        maxUses: 100,
        useCount: 1,
        expiresAt: null,
        revokedAt: null,
        isDemo: true,
      },
    ],
    feedback: [],
    curation: [
      {
        viewerId: viewerDemoProfile.id,
        targetId: "demo-12",
        action: "promote",
        reason: "Steward note: introduction craft is unusually relevant to this member's goals.",
      },
    ],
    intros: structuredClone(demoIntros),
    events: structuredClone(demoEvents),
    eventRegs: [],
    channels: [
      ...structuredClone(demoChannels),
      {
        id: "dm-demo-01-demo-12",
        slug: "dm-p-adler",
        name: "P. Adler",
        kind: "dm" as const,
        topic: "Private member communication. DEMO. Not E2EE.",
        unread: 1,
        isDemo: true,
      },
      {
        id: "ch-crossing-demo-accepted",
        slug: "crossing-voss-moreau",
        name: "C. Moreau",
        kind: "dm" as const,
        topic: "Opened after acceptance. DEMO. Not E2EE.",
        unread: 1,
        isDemo: true,
      },
      {
        id: "ch-table-london",
        slug: "table-london-demo",
        name: "Table · London",
        kind: "private" as const,
        topic: "Confirmed guests only. Neighborhood: Marylebone. DEMO.",
        unread: 0,
        isDemo: true,
      },
    ],
    messages: [
      ...structuredClone(demoMessages),
      {
        id: "msg-dm-adler-1",
        channelId: "dm-demo-01-demo-12",
        authorName: "P. Adler",
        authorInitials: "PA",
        body: "If the introduction is useful, write when you are free — not a pitch.",
        createdAt: "2026-09-13T18:20:00.000Z",
        isDemo: true,
      },
      {
        id: "msg-crossing-1",
        channelId: "ch-crossing-demo-accepted",
        authorName: "C. Moreau",
        authorInitials: "CM",
        body: "DEMO: A walk on the 13th, city-level only. The house does not share live location.",
        createdAt: "2026-09-13T09:12:00.000Z",
        isDemo: true,
      },
    ],
    readChannels: [],
    audit: structuredClone(demoAudit),
    announcements: structuredClone(demoAnnouncements),
    crossings: {
      journeys: structuredClone(demoJourneys),
      requests: structuredClone(demoCrossingRequests),
      tables: structuredClone(demoGroupTables),
      hosts: structuredClone(demoCityHosts),
      notes: structuredClone(demoCityNotes),
      prefs: structuredClone(demoTravelPrefs),
      notifications: structuredClone(demoTravelNotifications),
      conversations: [
        {
          id: "ch-crossing-demo-accepted",
          crossingRequestId: "xreq-demo-accepted",
          participantIds: ["demo-01", "demo-09"],
          mode: "demo",
          createdAt: "2026-09-13T09:00:00.000Z",
          isDemo: true,
        },
        {
          id: "ch-table-london",
          tableId: "tbl-demo-london",
          participantIds: ["demo-01", "demo-03"],
          mode: "demo",
          createdAt: "2026-09-13T18:00:00.000Z",
          isDemo: true,
        },
      ],
      feedback: [],
      blocks: [],
      standings: {},
      travelWeights: { ...DEFAULT_TRAVEL_WEIGHTS },
    },
    circle: structuredClone(demoCircle),
    indexRemovals: [],
    houseNotifications: structuredClone(demoHouseNotifications),
    houseNotificationPrefs: [
      { profileId: viewerDemoProfile.id, ...DEFAULT_HOUSE_NOTIFICATION_PREFS },
    ],
    channelMembers: structuredClone(demoChannelMembers),
    rewards: seedRewardsState(),
    onboardingByAccount: {},
  };
}

type GlobalStore = { __tmPreview?: PreviewState };

function state(): PreviewState {
  const g = globalThis as GlobalStore;
  if (!g.__tmPreview) g.__tmPreview = seed();
  return g.__tmPreview;
}

export function resetPreviewStore() {
  (globalThis as GlobalStore).__tmPreview = seed();
}

export function getPreviewStore(): PreviewState {
  return state();
}

function audit(actor: string, action: string, entity: string, entityId?: string) {
  state().audit.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor,
    action,
    entity,
    at: new Date().toISOString(),
    isDemo: true,
  });
  if (entityId) {
    state().audit[0].entity = `${entity}:${entityId}`;
  }
}

export function viewerProfile(): ProfileRecord {
  const s = state();
  return s.profiles.find((p) => p.id === s.viewerId) ?? s.profiles[0];
}

export function recordStewardNote(input: { actor: string; message: string }) {
  const message = input.message.trim().slice(0, 2000);
  if (!message) throw new Error("Write a note.");
  audit(input.actor.slice(0, 120) || "member", "help.contact", "steward_note");
  state().audit[0].entity = `steward_note:${message}`;
  return { ok: true as const };
}

export function setWeights(next: MatchingWeights, actor = "administrator") {
  state().weights = { ...next };
  audit(actor, "matching.weights_updated", "matching_weights");
  return state().weights;
}

export function setOpenHouse(next: Partial<OpenHouseConfig>, actor = "administrator") {
  state().openHouse = { ...state().openHouse, ...next };
  audit(actor, "open_house.schedule_updated", "site_config");
  return state().openHouse;
}

export function recordFeedback(entry: MatchFeedback, actor = "member") {
  const s = state();
  s.feedback = s.feedback.filter(
    (f) => !(f.viewerId === entry.viewerId && f.targetId === entry.targetId && f.signal === entry.signal),
  );
  s.feedback.push(entry);
  audit(actor, `match.feedback.${entry.signal}`, "match_feedback", entry.targetId);
}

export function setCuration(entry: MatchCuration, actor = "administrator") {
  if (!entry.reason.trim()) {
    throw new Error("A written reason is required.");
  }
  const s = state();
  s.curation = s.curation.filter(
    (c) => !(c.viewerId === entry.viewerId && c.targetId === entry.targetId),
  );
  s.curation.push(entry);
  audit(actor, `match.curation.${entry.action}`, "match_curation", entry.targetId);
  return entry;
}

export function acceptedThisCohort(month = state().cohortMonth): number {
  return state().applications.filter(
    (a) =>
      a.cohortMonth === month &&
      (a.status === "approved_payment_pending" || a.status === "active_member"),
  ).length;
}

export function setApplicationStatus(input: {
  id: string;
  status: ApplicationStatus;
  override?: boolean;
  actor?: string;
}): { ok: boolean; message: string; application?: ApplicationRecord } {
  const s = state();
  const app = s.applications.find((a) => a.id === input.id);
  if (!app) return { ok: false, message: "Application not found." };

  const approving =
    input.status === "approved_payment_pending" || input.status === "active_member";
  if (approving) {
    const used = acceptedThisCohort(app.cohortMonth);
    if (used >= s.admissionsCap && !input.override) {
      return {
        ok: false,
        message: `Cap reached (${s.admissionsCap}). Waitlist, move to the next cohort, or override with a written log.`,
      };
    }
  }

  app.status = input.status;
  app.updatedAt = new Date().toISOString();
  if (approving && app.referralCode) {
    creditMemberForAdmittedReferralCode(app);
  }
  audit(
    input.actor ?? "administrator",
    input.override ? `admissions.${input.status}.override` : `admissions.${input.status}`,
    "application",
    app.id,
  );
  return { ok: true, message: `Status set to ${input.status.replaceAll("_", " ")}.`, application: app };
}

export function shiftApplicationCohort(id: string, actor = "administrator") {
  const app = state().applications.find((a) => a.id === id);
  if (!app) return { ok: false as const, message: "Application not found." };
  const [y, m] = app.cohortMonth.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  app.cohortMonth = next;
  app.status = "waitlisted";
  app.updatedAt = new Date().toISOString();
  audit(actor, "admissions.next_cohort", "application", id);
  return { ok: true as const, message: `Moved to ${next} waitlist.`, application: app };
}

export function addApplication(row: ApplicationRecord) {
  state().applications.unshift(row);
  audit("system", "admissions.submitted", "application", row.id);
}

export function createReferral(input: {
  code: string;
  label: string;
  maxUses: number;
  actor?: string;
}): { ok: boolean; message: string; referral?: ReferralRecord } {
  const code = input.code.trim().toUpperCase();
  if (code.length < 4) return { ok: false, message: "Choose a longer code." };
  if (state().referrals.some((r) => r.code === code)) {
    return { ok: false, message: "That code already exists." };
  }
  const referral: ReferralRecord = {
    id: `ref-${Date.now()}`,
    code,
    token: `token-${code.toLowerCase()}`,
    createdByName: input.actor ?? "Preview steward",
    label: input.label || "Steward-issued",
    maxUses: input.maxUses,
    useCount: 0,
    expiresAt: null,
    revokedAt: null,
    isDemo: true,
  };
  state().referrals.unshift(referral);
  audit(input.actor ?? "administrator", "referral.created", "referral", referral.id);
  return { ok: true, message: "Referral issued.", referral };
}

export function revokeReferral(id: string, actor = "administrator") {
  const referral = state().referrals.find((r) => r.id === id);
  if (!referral) return { ok: false as const, message: "Not found." };
  referral.revokedAt = new Date().toISOString();
  audit(actor, "referral.revoked", "referral", id);
  return { ok: true as const, message: "Revoked.", referral };
}

export function requestIntro(input: {
  fromId: string;
  targetId: string;
  fromName: string;
  toName: string;
  note?: string;
}): IntroRequest {
  const existing = state().intros.find(
    (i) => i.fromId === input.fromId && i.targetId === input.targetId,
  );
  if (existing) return existing;
  const row: IntroRequest = {
    id: `intro-${Date.now()}`,
    status: "requested",
    isDemo: true,
    ...input,
  };
  state().intros.unshift(row);
  recordFeedback({
    viewerId: input.fromId,
    targetId: input.targetId,
    signal: "accepted",
  });
  pushHouseNotification({
    recipientId: input.targetId,
    kind: "intro",
    title: "An introduction was requested",
    body: `${input.fromName} asked to meet ${input.toName}. SYNTHETIC DEMO.`,
    href: `/member/members/${input.fromId}`,
  });
  audit(input.fromName, "intro.requested", "introduction", row.id);
  return row;
}

export function registerForEvent(eventId: string, accountId: string) {
  const event = state().events.find((e) => e.id === eventId);
  if (!event) return { ok: false as const, message: "Event not found." };
  if (state().eventRegs.some((r) => r.eventId === eventId && r.accountId === accountId)) {
    return { ok: true as const, message: "Already listed.", event };
  }
  if (event.registered >= event.capacity) {
    event.waitlist += 1;
    state().eventRegs.push({ eventId, accountId, status: "waitlist" });
    audit(accountId, "event.waitlist", "event", eventId);
    return { ok: true as const, message: "Added to the waitlist. This listing has not occurred.", event };
  }
  event.registered += 1;
  state().eventRegs.push({ eventId, accountId, status: "registered" });
  audit(accountId, "event.registered", "event", eventId);
  return { ok: true as const, message: "Listed for a planned gathering. It has not occurred.", event };
}

export function updateViewerProfile(patch: Partial<ProfileRecord>) {
  const s = state();
  const profile = s.profiles.find((p) => p.id === s.viewerId);
  if (!profile) return null;
  Object.assign(profile, patch);
  profile.completion = profileCompletion(profile);
  profile.isDemo = true;
  audit("member", "profile.updated", "profile", profile.id);
  return profile;
}

function onboardingBag(): Record<string, StoredOnboarding> {
  const s = state();
  if (!s.onboardingByAccount) s.onboardingByAccount = {};
  return s.onboardingByAccount;
}

export function readOnboardingPreview(accountId: string): StoredOnboarding | null {
  return onboardingBag()[accountId] ?? null;
}

export function writeOnboardingPreview(
  accountId: string,
  draft: OnboardingDraft,
  status: OnboardingStatus,
) {
  onboardingBag()[accountId] = {
    draft,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function clearOnboardingPreview(accountId: string) {
  delete onboardingBag()[accountId];
}

export function postMessage(input: {
  channelId: string;
  body: string;
  authorName: string;
  authorInitials: string;
  parentId?: string;
}): MessageRecord {
  const message: MessageRecord = {
    id: `msg-${Date.now()}`,
    channelId: input.channelId,
    body: input.body,
    authorName: input.authorName,
    authorInitials: input.authorInitials,
    createdAt: new Date().toISOString(),
    isDemo: true,
    parentId: input.parentId,
    reactions: {},
  };
  state().messages.push(message);
  if (input.parentId) {
    const parent = state().messages.find((m) => m.id === input.parentId);
    if (parent) parent.threadCount = (parent.threadCount ?? 0) + 1;
  }
  const channel = state().channels.find((c) => c.id === input.channelId);
  if (channel && !state().readChannels.includes(channel.id)) {
    channel.unread += 1;
  }
  return message;
}

export function reactToMessage(messageId: string, reaction: string, authorName: string) {
  const message = state().messages.find((m) => m.id === messageId);
  if (!message) return null;
  message.reactions = message.reactions ?? {};
  const names = new Set(message.reactions[reaction] ?? []);
  if (names.has(authorName)) names.delete(authorName);
  else names.add(authorName);
  message.reactions[reaction] = [...names];
  return message;
}

export function markChannelRead(channelId: string) {
  const channel = state().channels.find((c) => c.id === channelId);
  if (channel) channel.unread = 0;
  if (!state().readChannels.includes(channelId)) state().readChannels.push(channelId);
}

export function unreadTotal(): number {
  return state().channels.reduce((n, c) => n + c.unread, 0);
}

export function crossingsState(): CrossingsState {
  return state().crossings;
}

export function circleFor(ownerId: string): CircleEdge[] {
  return state().circle.filter((e) => e.ownerId === ownerId);
}

export function addMemberToCircle(ownerId: string, memberId: string) {
  const s = state();
  const next = addToCircle(s.circle, ownerId, memberId);
  s.circle = next.edges;
  if (next.added) {
    const owner = s.profiles.find((p) => p.id === ownerId);
    pushHouseNotification({
      recipientId: memberId,
      kind: "circle_add",
      title: `${owner?.displayName ?? "A member"} added you to Your Circle`,
      body: "A manual addition — not a For you suggestion. SYNTHETIC DEMO.",
      href: `/member/members/${ownerId}`,
    });
    audit(ownerId, "circle.added", "circle", memberId);
  }
  return next;
}

export function removeMemberFromCircle(ownerId: string, memberId: string) {
  const next = removeFromCircle(state().circle, ownerId, memberId);
  state().circle = next.edges;
  if (next.removed) audit(ownerId, "circle.removed", "circle", memberId);
  return next;
}

export function hideFromIndex(viewerId: string, targetId: string) {
  const next = removeFromIndex(state().indexRemovals, viewerId, targetId);
  state().indexRemovals = next.removals;
  if (next.removed) {
    recordFeedback({ viewerId, targetId, signal: "hidden" });
    audit(viewerId, "index.removed", "index", targetId);
  }
  return next;
}

export function unhideFromIndex(viewerId: string, targetId: string) {
  const next = restoreToIndex(state().indexRemovals, viewerId, targetId);
  state().indexRemovals = next.removals;
  if (next.restored) audit(viewerId, "index.restored", "index", targetId);
  return next;
}

export function reportMember(viewerId: string, targetId: string) {
  audit(viewerId, "member.reported", "profile", targetId);
  return { ok: true as const };
}

export function pushHouseNotification(
  input: Omit<HouseNotification, "id" | "createdAt" | "read" | "isDemo" | "recipientId"> & {
    recipientId: string;
  },
) {
  const prefs = housePrefsFor(input.recipientId);
  const kindKey =
    input.kind === "channel_join"
      ? "channelJoin"
      : input.kind === "circle_add"
        ? "circle"
        : input.kind === "index_add"
          ? "index"
          : input.kind === "intro"
            ? "intros"
            : input.kind === "event"
              ? "events"
              : input.kind === "announcement"
                ? "announcements"
                : "circle";
  const channel = prefs[kindKey as keyof HouseNotificationPrefs];
  if (channel && typeof channel === "object" && "inApp" in channel && !channel.inApp) {
    return null;
  }
  const row: HouseNotification = {
    id: `hn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
    isDemo: true,
    ...input,
  };
  state().houseNotifications.unshift(row);
  return row;
}

export function housePrefsFor(profileId: string): HouseNotificationPrefs {
  const s = state();
  const existing = s.houseNotificationPrefs.find((p) => p.profileId === profileId);
  if (existing) return existing;
  const created: HouseNotificationPrefs = { profileId, ...DEFAULT_HOUSE_NOTIFICATION_PREFS };
  s.houseNotificationPrefs.push(created);
  return created;
}

export function setHouseNotificationPrefs(
  profileId: string,
  patch: Partial<Omit<HouseNotificationPrefs, "profileId">>,
) {
  const prefs = housePrefsFor(profileId);
  Object.assign(prefs, patch);
  audit(profileId, "notifications.prefs_updated", "notification_prefs");
  return prefs;
}

export function markHouseNotificationsRead(recipientId: string, ids?: string[]) {
  for (const n of state().houseNotifications) {
    if (n.recipientId !== recipientId) continue;
    if (!ids || ids.includes(n.id)) n.read = true;
  }
}

export function unreadHouseNotifications(recipientId: string): number {
  return state().houseNotifications.filter((n) => n.recipientId === recipientId && !n.read).length;
}

export function addGalleryPhoto(profileId: string, input: { caption: string; kind?: "work" | "portfolio" }) {
  const profile = state().profiles.find((p) => p.id === profileId);
  if (!profile) return null;
  const photo: GalleryUpload = stubGalleryUpload(input);
  profile.gallery = [...(profile.gallery ?? []), photo];
  profile.isDemo = true;
  audit(profileId, "profile.gallery_added", "profile", profileId);
  return photo;
}

export function openDirectMessage(fromId: string, toId: string) {
  const s = state();
  const existing = s.channels.find(
    (c) =>
      c.kind === "dm" &&
      (s.channelMembers[c.id] ?? []).includes(fromId) &&
      (s.channelMembers[c.id] ?? []).includes(toId),
  );
  if (existing) return existing;
  const from = s.profiles.find((p) => p.id === fromId);
  const to = s.profiles.find((p) => p.id === toId);
  const channel: ChannelRecord = {
    id: `dm-${fromId}-${toId}`,
    slug: `dm-${to?.displayName.replace(/\s+/g, "-").toLowerCase() ?? toId}`,
    name: `Message · ${to?.displayName ?? "Member"}`,
    kind: "dm",
    topic: "Private member communication. DEMO. Not E2EE. Absolutely no soliciting.",
    unread: 0,
    isDemo: true,
  };
  s.channels.unshift(channel);
  s.channelMembers[channel.id] = [fromId, toId];
  audit(from?.displayName ?? fromId, "dm.opened", "channel", channel.id);
  return channel;
}

export function viewerRewardsSnapshot() {
  const viewer = viewerProfile();
  const s = state();
  return buildRewardsSnapshot({
    member: viewer,
    state: s.rewards,
    siteUrl: env.siteUrl,
    admissionsCap: s.admissionsCap,
  });
}

export function submitMemberReferral(input: {
  fullName: string;
  email: string;
  linkedin?: string;
  city: string;
  howYouKnowThem: string;
  note?: string;
}) {
  const viewer = viewerProfile();
  const result = submitReferral(state().rewards, { ...input, referrerId: viewer.id });
  if (!result.ok) return result;
  state().rewards = result.state;
  const code = memberReferralCode(viewer);
  const issued = state().referrals.find((r) => r.code === code);
  if (issued) issued.useCount += 1;
  audit(viewer.displayName, "rewards.referral_submitted", "member_referral", result.referral.id);
  return result;
}

export function withdrawMemberReferral(referralId: string) {
  const viewer = viewerProfile();
  const result = withdrawReferral(state().rewards, { memberId: viewer.id, referralId });
  if (!result.ok) return result;
  state().rewards = result.state;
  audit(viewer.displayName, "rewards.referral_withdrawn", "member_referral", referralId);
  return result;
}

export function advanceMemberReferral(referralId: string, to?: "declined") {
  const viewer = viewerProfile();
  const result = advanceReferral(state().rewards, { memberId: viewer.id, referralId, to });
  if (!result.ok) return result;
  state().rewards = result.state;
  audit(viewer.displayName, "rewards.referral_advanced", "member_referral", referralId);
  return result;
}

export function reserveMemberReward(rewardId: string) {
  const viewer = viewerProfile();
  const result = reserveReward(state().rewards, { memberId: viewer.id, rewardId });
  if (!result.ok) return result;
  state().rewards = result.state;
  audit(viewer.displayName, "rewards.reserved", "reward_reservation", result.reservation.id);
  return result;
}

export function cancelMemberReservation(reservationId: string) {
  const viewer = viewerProfile();
  const result = cancelReservation(state().rewards, { memberId: viewer.id, reservationId });
  if (!result.ok) return result;
  state().rewards = result.state;
  audit(viewer.displayName, "rewards.reserve_cancelled", "reward_reservation", reservationId);
  return result;
}

export function requestMemberRedemption(input: {
  rewardId: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  guestName?: string;
  shippingName?: string;
  shippingCity?: string;
  shippingRegion?: string;
  shippingCountry?: string;
}) {
  const viewer = viewerProfile();
  const result = requestRedemption(state().rewards, { ...input, memberId: viewer.id });
  if (!result.ok) return result;
  state().rewards = result.state;
  audit(viewer.displayName, "rewards.redeemed", "reward_redemption", result.redemption.id);
  return result;
}

export function advanceMemberRedemption(redemptionId: string) {
  const viewer = viewerProfile();
  const result = advanceRedemption(state().rewards, { memberId: viewer.id, redemptionId });
  if (!result.ok) return result;
  state().rewards = result.state;
  audit(viewer.displayName, "rewards.redemption_advanced", "reward_redemption", redemptionId);
  return result;
}

export function recordPaidMembership(
  input: Omit<PaidMembershipRecord, "paidAt" | "isDemo" | "canceledAt"> & { paidAt?: string },
): { already: boolean; record: PaidMembershipRecord } {
  const s = state();
  const byEvent = s.paidMemberships.find((m) => m.eventId === input.eventId);
  if (byEvent) return { already: true, record: byEvent };
  const existing = s.paidMemberships.find(
    (m) =>
      (input.accountId && m.accountId === input.accountId) ||
      (input.email && m.email && input.email && m.email.toLowerCase() === input.email.toLowerCase()),
  );
  const record: PaidMembershipRecord = {
    ...(existing ?? {}),
    ...input,
    status: "active",
    paidAt: input.paidAt ?? new Date().toISOString(),
    canceledAt: undefined,
    isDemo: true,
  };
  if (existing) {
    const already = existing.status === "active";
    Object.assign(existing, record);
    audit("stripe", `membership.paid.${input.source}`, "membership", input.accountId || input.eventId);
    return { already, record: existing };
  }
  s.paidMemberships.unshift(record);
  if (input.applicationId) {
    const app = s.applications.find((a) => a.id === input.applicationId);
    if (app) {
      app.status = "active_member";
      app.updatedAt = record.paidAt;
    }
  }
  audit("stripe", `membership.paid.${input.source}`, "membership", input.accountId || input.eventId);
  return { already: false, record };
}

export function revokePaidMembership(input: {
  accountId?: string | null;
  email?: string | null;
  stripeSubscriptionId?: string | null;
  eventId: string;
}): { already: boolean; record: PaidMembershipRecord | null } {
  const s = state();
  const record = s.paidMemberships.find(
    (m) =>
      (input.accountId && m.accountId === input.accountId) ||
      (input.stripeSubscriptionId && m.stripeSubscriptionId === input.stripeSubscriptionId) ||
      (input.email && m.email && m.email.toLowerCase() === input.email.toLowerCase()),
  );
  if (!record) return { already: false, record: null };
  if (record.status === "canceled") return { already: true, record };
  record.status = "canceled";
  record.canceledAt = new Date().toISOString();
  record.eventId = input.eventId;
  audit("stripe", "membership.revoked", "membership", record.accountId || input.eventId);
  return { already: false, record };
}

export function membershipFor(accountId?: string | null, email?: string | null) {
  const s = state();
  return (
    s.paidMemberships.find(
      (m) =>
        (accountId && m.accountId && m.accountId === accountId) ||
        (email && m.email && m.email.toLowerCase() === email.toLowerCase()),
    ) ?? null
  );
}

export function hadPaidMembership(accountId?: string | null, email?: string | null) {
  return Boolean(membershipFor(accountId, email));
}

export function foundingSeatsTaken() {
  return state().paidMemberships.filter((m) => m.product === "founding").length;
}

/** @deprecated Use membershipFor */
export function lifetimeMembershipFor(accountId?: string | null, email?: string | null) {
  return membershipFor(accountId, email);
}

function creditMemberForAdmittedReferralCode(app: ApplicationRecord) {
  const code = (app.referralCode ?? "").trim().toUpperCase();
  if (!code) return;
  const issued = state().referrals.find((r) => r.code.toUpperCase() === code);
  if (!issued) return;
  const owner = state().profiles.find(
    (p) => memberReferralCode(p) === code || issued.createdByName === p.displayName,
  );
  if (!owner) return;
  if (issued.label.startsWith("TEST-ONLY") || issued.createdByName === "Preview steward") {
    return;
  }
  state().rewards = creditReferrerForAdmittedApplication(state().rewards, {
    referrerId: owner.id,
    fullName: app.fullName,
    email: app.email,
    city: app.city,
  });
}

