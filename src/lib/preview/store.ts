import {
  demoAnnouncements,
  demoApplications,
  demoAudit,
  demoChannels,
  demoEvents,
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
import { demoAskFeedback, demoHelpAsks } from "@/lib/data/ask-demo";
import type { MatchCuration, MatchFeedback, MatchingWeights } from "@/lib/matching/types";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";
import type { AskFeedback, AskMatchWeights, HelpAskRecord } from "@/lib/matching/ask/types";
import { DEFAULT_ASK_WEIGHTS } from "@/lib/matching/ask/types";
import { profileCompletion } from "@/lib/profile/completion";

export interface PreviewState {
  weights: MatchingWeights;
  openHouse: OpenHouseConfig;
  admissionsCap: number;
  cohortMonth: string;
  profiles: ProfileRecord[];
  viewerId: string;
  applications: ApplicationRecord[];
  referrals: ReferralRecord[];
  feedback: MatchFeedback[];
  curation: MatchCuration[];
  helpAsks: HelpAskRecord[];
  askFeedback: AskFeedback[];
  askWeights: AskMatchWeights;
  lastAskId: string | null;
  intros: IntroRequest[];
  events: EventRecord[];
  eventRegs: { eventId: string; accountId: string; status: "registered" | "waitlist" }[];
  channels: ChannelRecord[];
  messages: MessageRecord[];
  readChannels: string[];
  audit: AuditEvent[];
  announcements: typeof demoAnnouncements;
  crossings: CrossingsState;
}

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
    referrals: structuredClone(demoReferrals),
    feedback: [],
    helpAsks: structuredClone(demoHelpAsks),
    askFeedback: structuredClone(demoAskFeedback),
    askWeights: { ...DEFAULT_ASK_WEIGHTS },
    lastAskId: demoHelpAsks[0]?.id ?? null,
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
        id: "ch-crossing-demo-accepted",
        slug: "crossing-voss-moreau",
        name: "A Crossing · Paris",
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

export function setAskWeights(next: AskMatchWeights, actor = "administrator") {
  state().askWeights = { ...next };
  audit(actor, "ask.weights_updated", "ask_match_weights");
  return state().askWeights;
}

export function recordHelpAsk(row: HelpAskRecord, actor = "member") {
  const s = state();
  s.helpAsks = s.helpAsks.filter((a) => a.id !== row.id);
  s.helpAsks.unshift(row);
  s.lastAskId = row.id;
  audit(actor, "ask.recorded", "help_asks", row.id);
  return row;
}

export function recordAskFeedback(entry: AskFeedback, actor = "member") {
  const s = state();
  s.askFeedback = s.askFeedback.filter(
    (f) =>
      !(
        f.askId === entry.askId &&
        f.viewerId === entry.viewerId &&
        f.targetId === entry.targetId &&
        f.signal === entry.signal
      ),
  );
  s.askFeedback.push(entry);
  audit(actor, `ask.feedback.${entry.signal}`, "help_ask_feedback", entry.targetId);
}

export function openDemoDm(target: ProfileRecord): ChannelRecord {
  const slug = `dm-${target.id}`;
  const existing = state().channels.find((c) => c.slug === slug);
  if (existing) return existing;
  const channel: ChannelRecord = {
    id: `ch-dm-${target.id}`,
    slug,
    name: target.displayName,
    kind: "dm",
    topic: `Private conversation with ${target.displayName}. DEMO. Not E2EE.`,
    unread: 0,
    isDemo: true,
  };
  state().channels.unshift(channel);
  audit("member", "channel.dm_opened", "channel", channel.id);
  return channel;
}

export function lastHelpAsk(viewerId?: string): HelpAskRecord | undefined {
  const s = state();
  if (s.lastAskId) {
    const hit = s.helpAsks.find((a) => a.id === s.lastAskId && (!viewerId || a.viewerId === viewerId));
    if (hit) return hit;
  }
  return s.helpAsks.find((a) => !viewerId || a.viewerId === viewerId);
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
