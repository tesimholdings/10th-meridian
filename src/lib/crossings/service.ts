import type { AppRole, ChannelRecord, ProfileRecord } from "@/lib/data/types";
import type { BlockRecord } from "@/lib/matching/types";
import type { MatchIndex } from "@/lib/matching/service";
import { hasStream } from "@/lib/env";
import {
  effectiveJourneyStatus,
  isJourneyExpired,
  sameCity,
} from "@/lib/crossings/dates";
import { crossingIcs } from "@/lib/crossings/ics";
import { scoreTravelMatches, suggestTables } from "@/lib/crossings/matching";
import { buildTravelNotifications } from "@/lib/crossings/notifications";
import {
  assertSafeTravelText,
  canMutateCrossings,
  canViewerSeeJourney,
  venueVisibleTo,
} from "@/lib/crossings/privacy";
import type {
  CityHostRecord,
  CityNoteRecord,
  CrossingConversation,
  CrossingRequestRecord,
  GroupTableRecord,
  JourneyRecord,
  MembershipStanding,
  TravelMatchFeedback,
  TravelMatchWeights,
  TravelNotificationPref,
  TravelNotificationRecord,
} from "@/lib/crossings/types";
import { DEFAULT_TRAVEL_WEIGHTS, JOURNEY_VISIBILITY, MEETING_FORMATS, TRAVEL_INTENTS } from "@/lib/crossings/types";

export interface CrossingsState {
  journeys: JourneyRecord[];
  requests: CrossingRequestRecord[];
  tables: GroupTableRecord[];
  hosts: CityHostRecord[];
  notes: CityNoteRecord[];
  prefs: TravelNotificationPref[];
  notifications: TravelNotificationRecord[];
  conversations: CrossingConversation[];
  feedback: TravelMatchFeedback[];
  blocks: BlockRecord[];
  standings: Record<string, MembershipStanding>;
  travelWeights: TravelMatchWeights;
}

export function emptyCrossingsState(): CrossingsState {
  return {
    journeys: [],
    requests: [],
    tables: [],
    hosts: [],
    notes: [],
    prefs: [],
    notifications: [],
    conversations: [],
    feedback: [],
    blocks: [],
    standings: {},
    travelWeights: { ...DEFAULT_TRAVEL_WEIGHTS },
  };
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createJourney(
  state: CrossingsState,
  input: Omit<JourneyRecord, "id" | "status" | "createdAt" | "updatedAt" | "isDemo"> & {
    id?: string;
    isDemo?: boolean;
  },
  now = new Date(),
): JourneyRecord {
  assertSafeTravelText(input.privateNote);
  assertSafeTravelText(input.destinationCity);
  if (input.arrivalDate > input.departureDate) {
    throw new Error("Departure must be on or after arrival.");
  }
  if (!input.availability.length) throw new Error("Choose at least one availability.");
  if (!input.intents.length) throw new Error("Choose at least one intent.");
  const row: JourneyRecord = {
    ...input,
    id: input.id ?? id("jny"),
    status: "active",
    isDemo: input.isDemo ?? true,
    selectedChannelIds: input.selectedChannelIds ?? [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  state.journeys.unshift(row);
  return row;
}

export function updateJourney(
  state: CrossingsState,
  journeyId: string,
  actorId: string,
  patch: Partial<JourneyRecord>,
  now = new Date(),
): JourneyRecord {
  const row = state.journeys.find((j) => j.id === journeyId);
  if (!row) throw new Error("Journey not found.");
  if (row.profileId !== actorId) throw new Error("You may only edit your own journey.");
  if (patch.privateNote !== undefined) assertSafeTravelText(patch.privateNote);
  if (patch.arrivalDate && patch.departureDate && patch.arrivalDate > patch.departureDate) {
    throw new Error("Departure must be on or after arrival.");
  }
  Object.assign(row, patch, { updatedAt: now.toISOString(), isDemo: true });
  if (isJourneyExpired(row, now) && row.status === "active") row.status = "expired";
  return row;
}

export function pauseJourney(state: CrossingsState, journeyId: string, actorId: string, now = new Date()) {
  return updateJourney(state, journeyId, actorId, { status: "paused" }, now);
}

export function resumeJourney(state: CrossingsState, journeyId: string, actorId: string, now = new Date()) {
  return updateJourney(state, journeyId, actorId, { status: "active" }, now);
}

export function deleteJourney(state: CrossingsState, journeyId: string, actorId: string, now = new Date()) {
  return updateJourney(state, journeyId, actorId, { status: "deleted" }, now);
}

export function expireDueJourneys(state: CrossingsState, now = new Date()) {
  for (const j of state.journeys) {
    if (j.status === "active" && isJourneyExpired(j, now)) {
      j.status = "expired";
      j.updatedAt = now.toISOString();
    }
  }
}

export function visibleJourneysFor(input: {
  state: CrossingsState;
  viewerId: string;
  viewerRole: AppRole | null;
  meridianMatchIds: string[];
  sharedChannelIds: string[];
  now?: Date;
}): JourneyRecord[] {
  expireDueJourneys(input.state, input.now);
  return input.state.journeys.filter((journey) => {
    const owner = journey.profileId;
    if (owner !== input.viewerId) {
      const standing = input.state.standings[owner];
      if (standing === "suspended" || standing === "expired") return false;
      if (blockedPair(input.viewerId, owner, input.state.blocks)) return false;
    }
    return canViewerSeeJourney({
      journey,
      viewerId: input.viewerId,
      viewerRole: input.viewerRole,
      isMeridianMatch: input.meridianMatchIds.includes(owner),
      sharedChannelIds: input.sharedChannelIds,
      now: input.now,
    });
  });
}

function blockedPair(a: string, b: string, blocks: BlockRecord[]): boolean {
  return blocks.some((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
}

export function proposeCrossing(
  state: CrossingsState,
  input: {
    fromProfileId: string;
    toProfileId: string;
    journeyId: string;
    counterpartJourneyId?: string;
    format: CrossingRequestRecord["format"];
    proposedDates: string[];
    note?: string;
  },
  now = new Date(),
): CrossingRequestRecord {
  if (input.fromProfileId === input.toProfileId) throw new Error("A Crossing is between two people.");
  if (blockedPair(input.fromProfileId, input.toProfileId, state.blocks)) {
    throw new Error("This person is not available.");
  }
  const standing = state.standings[input.toProfileId];
  if (standing === "suspended" || standing === "expired") {
    throw new Error("This person is not available.");
  }
  assertSafeTravelText(input.note);
  const existing = state.requests.find(
    (r) =>
      r.fromProfileId === input.fromProfileId &&
      r.toProfileId === input.toProfileId &&
      r.journeyId === input.journeyId &&
      (r.status === "proposed" || r.status === "reschedule_suggested"),
  );
  if (existing) return existing;
  const row: CrossingRequestRecord = {
    id: id("xreq"),
    status: "proposed",
    isDemo: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...input,
  };
  state.requests.unshift(row);
  return row;
}

export function respondToCrossing(
  state: CrossingsState,
  input: {
    requestId: string;
    actorId: string;
    action: "accept" | "decline" | "reschedule";
    suggestedDates?: string[];
    profiles?: ProfileRecord[];
  },
  now = new Date(),
): CrossingRequestRecord {
  const row = state.requests.find((r) => r.id === input.requestId);
  if (!row) throw new Error("Request not found.");
  if (row.toProfileId !== input.actorId && row.fromProfileId !== input.actorId) {
    throw new Error("Only the people in this Crossing may respond.");
  }
  if (input.action === "decline") {
    row.status = "declined";
  } else if (input.action === "reschedule") {
    if (!input.suggestedDates?.length) throw new Error("Suggest at least one other time.");
    row.status = "reschedule_suggested";
    row.suggestedDates = input.suggestedDates;
  } else {
    row.status = "accepted";
    if (!row.conversationId) {
      const convo = openCrossingConversation(state, {
        crossingRequestId: row.id,
        participantIds: [row.fromProfileId, row.toProfileId],
      }, now);
      row.conversationId = convo.id;
      row.conversationMode = convo.mode;
    }
  }
  row.updatedAt = now.toISOString();
  return row;
}

export function openCrossingConversation(
  state: CrossingsState,
  input: { crossingRequestId?: string; tableId?: string; participantIds: string[] },
  now = new Date(),
): CrossingConversation {
  const existing = state.conversations.find((c) => {
    if (input.crossingRequestId && c.crossingRequestId === input.crossingRequestId) return true;
    if (input.tableId && c.tableId === input.tableId) return true;
    return false;
  });
  if (existing) return existing;
  const row: CrossingConversation = {
    id: id("xconvo"),
    crossingRequestId: input.crossingRequestId,
    tableId: input.tableId,
    participantIds: [...new Set(input.participantIds)],
    mode: hasStream() ? "stream" : "demo",
    createdAt: now.toISOString(),
    isDemo: true,
  };
  state.conversations.push(row);
  return row;
}

export function tableChannelFor(table: GroupTableRecord): ChannelRecord {
  return {
    id: table.channelId ?? `ch-table-${table.id}`,
    slug: `table-${table.id}`,
    name: `Table · ${table.city}`,
    kind: "private",
    topic: `Confirmed guests only. Neighborhood: ${table.neighborhood}. DEMO.`,
    unread: 0,
    isDemo: true,
  };
}

export function openTable(
  state: CrossingsState,
  input: Omit<GroupTableRecord, "id" | "createdAt" | "updatedAt" | "isDemo" | "guests" | "status" | "channelId"> & {
    guests?: GroupTableRecord["guests"];
  },
  now = new Date(),
): GroupTableRecord {
  if (input.maxGuests < 3) throw new Error("A table opens for at least three.");
  assertSafeTravelText(input.neighborhood);
  assertSafeTravelText(input.theme);
  const confirmed = (input.guests ?? []).filter((g) => g.status === "confirmed");
  const hostGuest = { profileId: input.openedByProfileId, status: "confirmed" as const };
  const guests = [
    hostGuest,
    ...(input.guests ?? []).filter((g) => g.profileId !== input.openedByProfileId),
  ];
  const row: GroupTableRecord = {
    ...input,
    id: id("tbl"),
    status: "open",
    guests,
    isDemo: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const convo = openCrossingConversation(
    state,
    { tableId: row.id, participantIds: [row.openedByProfileId, ...confirmed.map((g) => g.profileId)] },
    now,
  );
  row.channelId = convo.id;
  state.tables.unshift(row);
  return row;
}

export function joinTable(
  state: CrossingsState,
  tableId: string,
  profileId: string,
  now = new Date(),
): GroupTableRecord {
  const table = state.tables.find((t) => t.id === tableId);
  if (!table) throw new Error("Table not found.");
  if (table.status !== "open") throw new Error("This table is not open.");
  const confirmed = table.guests.filter((g) => g.status === "confirmed");
  if (confirmed.length >= table.maxGuests) throw new Error("This table is full.");
  const existing = table.guests.find((g) => g.profileId === profileId);
  if (existing) return table;
  if (table.joinMode === "invitation") {
    throw new Error("This table is invitation-only.");
  }
  table.guests.push({ profileId, status: "requested" });
  table.updatedAt = now.toISOString();
  return table;
}

export function decideTableGuest(
  state: CrossingsState,
  input: { tableId: string; actorId: string; profileId: string; accept: boolean; steward?: boolean; force?: boolean },
  now = new Date(),
): GroupTableRecord {
  const table = state.tables.find((t) => t.id === input.tableId);
  if (!table) throw new Error("Table not found.");
  const steward = input.steward === true;
  if (table.openedByProfileId !== input.actorId && !steward) throw new Error("Only the host may decide.");
  const guest = table.guests.find((g) => g.profileId === input.profileId);
  if (!guest) throw new Error("Guest not found.");
  if (input.accept) {
    const confirmed = table.guests.filter((g) => g.status === "confirmed").length;
    if (confirmed >= table.maxGuests && !input.force) throw new Error("This table is full.");
    guest.status = "confirmed";
    const convo = state.conversations.find((c) => c.tableId === table.id);
    if (convo && !convo.participantIds.includes(input.profileId)) {
      convo.participantIds.push(input.profileId);
    }
    if (!table.channelId) {
      const opened = openCrossingConversation(
        state,
        {
          tableId: table.id,
          participantIds: table.guests.filter((g) => g.status === "confirmed").map((g) => g.profileId),
        },
        now,
      );
      table.channelId = opened.id;
    }
  } else {
    guest.status = "declined";
  }
  table.updatedAt = now.toISOString();
  return table;
}

export function publicTableView(
  table: GroupTableRecord,
  viewerId: string,
  viewerRole: AppRole | null,
): GroupTableRecord {
  const confirmed = table.guests.filter((g) => g.status === "confirmed").map((g) => g.profileId);
  if (venueVisibleTo({ tableOpenedBy: table.openedByProfileId, confirmedIds: confirmed, viewerId, viewerRole })) {
    return table;
  }
  return { ...table, venuePrivate: undefined };
}

export function upsertCityHost(state: CrossingsState, host: Omit<CityHostRecord, "id" | "createdAt" | "isDemo"> & { id?: string }) {
  const existing = state.hosts.find(
    (h) => h.profileId === host.profileId && sameCity(h.city, h.country, host.city, host.country),
  );
  if (existing) {
    Object.assign(existing, host);
    return existing;
  }
  const row: CityHostRecord = {
    ...host,
    id: host.id ?? id("host"),
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  state.hosts.unshift(row);
  return row;
}

export function addCityNote(
  state: CrossingsState,
  input: Omit<CityNoteRecord, "id" | "createdAt" | "isDemo" | "savedBy" | "reportedBy" | "moderation">,
): CityNoteRecord {
  assertSafeTravelText(input.title);
  assertSafeTravelText(input.body);
  const row: CityNoteRecord = {
    ...input,
    id: id("note"),
    savedBy: [],
    reportedBy: [],
    moderation: "visible",
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  state.notes.unshift(row);
  return row;
}

export function saveCityNote(state: CrossingsState, noteId: string, profileId: string) {
  const note = state.notes.find((n) => n.id === noteId);
  if (!note) throw new Error("Note not found.");
  if (!note.savedBy.includes(profileId)) note.savedBy.push(profileId);
  return note;
}

export function reportCityNote(state: CrossingsState, noteId: string, profileId: string, reason: string) {
  assertSafeTravelText(reason);
  const note = state.notes.find((n) => n.id === noteId);
  if (!note) throw new Error("Note not found.");
  if (!note.reportedBy.includes(profileId)) note.reportedBy.push(profileId);
  if (note.reportedBy.length >= 2) note.moderation = "hidden";
  return note;
}

export function moderateCityNote(state: CrossingsState, noteId: string, hide: boolean) {
  const note = state.notes.find((n) => n.id === noteId);
  if (!note) throw new Error("Note not found.");
  note.moderation = hide ? "hidden" : "visible";
  return note;
}

export function visibleCityNotes(state: CrossingsState, isMemberAccess: boolean): CityNoteRecord[] {
  if (!isMemberAccess) {
    return state.notes.filter((n) => n.isDemo && n.moderation === "visible");
  }
  return state.notes.filter((n) => n.moderation === "visible");
}

export function blockMember(state: CrossingsState, a: string, b: string) {
  if (a === b) throw new Error("Cannot block yourself.");
  if (!state.blocks.some((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a))) {
    state.blocks.push({ a, b });
  }
}

export function matchesForJourney(input: {
  state: CrossingsState;
  viewer: ProfileRecord;
  journey: JourneyRecord;
  members: ProfileRecord[];
  meridian?: MatchIndex;
}) {
  expireDueJourneys(input.state);
  const hidden = new Set(
    input.state.feedback
      .filter((f) => f.viewerId === input.viewer.id && f.journeyId === input.journey.id && (f.signal === "hidden" || f.signal === "not_relevant"))
      .map((f) => f.targetId),
  );
  return scoreTravelMatches({
    viewer: input.viewer,
    viewerJourney: input.journey,
    members: input.members,
    journeys: input.state.journeys.filter((j) => effectiveJourneyStatus(j) === "active"),
    hosts: input.state.hosts,
    meridian: input.meridian,
    blocks: input.state.blocks,
    standings: input.state.standings,
    travelWeights: input.state.travelWeights,
  }).filter((m) => !hidden.has(m.target.id));
}

export function tableSuggestionsFor(state: CrossingsState, members: ProfileRecord[], viewerId: string) {
  return suggestTables({
    journeys: state.journeys.filter((j) => j.status === "active"),
    members,
    viewerId,
    blocks: state.blocks,
    standings: state.standings,
  });
}

export function refreshNotifications(
  state: CrossingsState,
  viewer: ProfileRecord,
  members: ProfileRecord[],
) {
  const prefs =
    state.prefs.find((p) => p.profileId === viewer.id) ?? {
      profileId: viewer.id,
      overlapDigest: true,
      goalRelevance: true,
      tableSuggestions: true,
      requestUpdates: true,
      digest: "weekly" as const,
    };
  const extra = buildTravelNotifications({
    viewer,
    journeys: state.journeys,
    members,
    requests: state.requests,
    prefs,
    existing: state.notifications.filter((n) => n.profileId === viewer.id),
    blocks: state.blocks,
    standings: state.standings,
  });
  state.notifications.push(...extra);
  return state.notifications.filter((n) => n.profileId === viewer.id);
}

export function icsForRequest(
  state: CrossingsState,
  requestId: string,
  profiles: ProfileRecord[],
): string {
  const req = state.requests.find((r) => r.id === requestId);
  if (!req || req.status !== "accepted") throw new Error("Calendar files exist only after acceptance.");
  const journey = state.journeys.find((j) => j.id === req.journeyId);
  if (!journey) throw new Error("Journey not found.");
  const from = profiles.find((p) => p.id === req.fromProfileId);
  const to = profiles.find((p) => p.id === req.toProfileId);
  return crossingIcs({
    request: req,
    journey,
    fromName: from?.displayName ?? "Member",
    toName: to?.displayName ?? "Member",
  });
}

export function assertActiveMember(role: AppRole | null | undefined) {
  if (!canMutateCrossings(role)) {
    throw new Error("Active members only. Open House shows synthetic demonstration data.");
  }
}

export const TRAVEL_ENUMS = { JOURNEY_VISIBILITY, MEETING_FORMATS, TRAVEL_INTENTS };
