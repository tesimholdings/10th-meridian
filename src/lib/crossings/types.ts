import type { MatchExplanation, ProfileRecord } from "@/lib/data/types";

export const MEETING_FORMATS = [
  "breakfast",
  "coffee",
  "lunch",
  "walk",
  "drinks",
  "dinner",
  "event",
  "open",
] as const;

export type MeetingFormat = (typeof MEETING_FORMATS)[number];

export const TRAVEL_INTENTS = [
  "professional",
  "social",
  "cultural",
  "investment",
  "collaboration",
  "friendship",
  "open",
] as const;

export type TravelIntent = (typeof TRAVEL_INTENTS)[number];

export const JOURNEY_VISIBILITY = [
  "all_members",
  "meridian_matches",
  "selected_channels",
  "administrators",
] as const;

export type JourneyVisibility = (typeof JOURNEY_VISIBILITY)[number];

export const JOURNEY_STATUS = ["active", "paused", "expired", "deleted"] as const;
export type JourneyStatus = (typeof JOURNEY_STATUS)[number];

export const CROSSING_REQUEST_STATUS = [
  "proposed",
  "accepted",
  "declined",
  "reschedule_suggested",
  "cancelled",
] as const;
export type CrossingRequestStatus = (typeof CROSSING_REQUEST_STATUS)[number];

export const TABLE_JOIN_MODES = ["request", "invitation"] as const;
export type TableJoinMode = (typeof TABLE_JOIN_MODES)[number];

export const TABLE_STATUS = ["suggested", "open", "closed", "cancelled"] as const;
export type TableStatus = (typeof TABLE_STATUS)[number];

export const CITY_NOTE_KINDS = [
  "restaurant",
  "hotel",
  "bar",
  "gallery",
  "club",
  "workspace",
  "cultural",
  "practical",
] as const;
export type CityNoteKind = (typeof CITY_NOTE_KINDS)[number];

export const MEMBERSHIP_STANDINGS = ["active", "expired", "suspended"] as const;
export type MembershipStanding = (typeof MEMBERSHIP_STANDINGS)[number];

export interface TravelMatchWeights {
  meridian: number;
  overlap: number;
  intent: number;
  complementary: number;
  availability: number;
}

export const DEFAULT_TRAVEL_WEIGHTS: TravelMatchWeights = {
  meridian: 0.4,
  overlap: 0.25,
  intent: 0.15,
  complementary: 0.1,
  availability: 0.1,
};

/** Days added to each side of a flexible journey when testing overlap. */
export const FLEXIBLE_WINDOW_DAYS = 3;

export interface JourneyRecord {
  id: string;
  profileId: string;
  destinationCity: string;
  destinationCountry: string;
  arrivalDate: string;
  departureDate: string;
  timezone: string;
  flexibleDates: boolean;
  availability: MeetingFormat[];
  intents: TravelIntent[];
  privateNote?: string;
  visibility: JourneyVisibility;
  openToOneToOne: boolean;
  openToGroupTable: boolean;
  needsLocalRecommendation: boolean;
  willingCityHost: boolean;
  status: JourneyStatus;
  selectedChannelIds: string[];
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrossingRequestRecord {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  journeyId: string;
  counterpartJourneyId?: string;
  format: MeetingFormat;
  proposedDates: string[];
  note?: string;
  status: CrossingRequestStatus;
  suggestedDates?: string[];
  conversationId?: string;
  conversationMode?: "stream" | "demo";
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupTableGuest {
  profileId: string;
  status: "invited" | "requested" | "confirmed" | "declined";
}

export interface GroupTableRecord {
  id: string;
  city: string;
  country: string;
  neighborhood: string;
  venuePrivate?: string;
  dateTime: string;
  timezone: string;
  mealType: MeetingFormat;
  theme?: string;
  maxGuests: number;
  joinMode: TableJoinMode;
  status: TableStatus;
  openedByProfileId: string;
  guests: GroupTableGuest[];
  channelId?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CityHostRecord {
  id: string;
  profileId: string;
  city: string;
  country: string;
  timezone: string;
  availableFrom?: string;
  availableTo?: string;
  recurring: boolean;
  meetingTypes: MeetingFormat[];
  expertise: string[];
  welcomeDirectRequests: boolean;
  maxRequestsPerWeek: number;
  isDemo: boolean;
  createdAt: string;
}

export interface CityNoteRecord {
  id: string;
  authorProfileId: string;
  city: string;
  country: string;
  kind: CityNoteKind;
  title: string;
  body: string;
  neighborhood?: string;
  savedBy: string[];
  reportedBy: string[];
  moderation: "visible" | "hidden";
  isDemo: boolean;
  createdAt: string;
}

export interface TravelNotificationPref {
  profileId: string;
  overlapDigest: boolean;
  goalRelevance: boolean;
  tableSuggestions: boolean;
  requestUpdates: boolean;
  digest: "off" | "daily" | "weekly";
}

export interface TravelNotificationRecord {
  id: string;
  profileId: string;
  kind: "overlap" | "goal" | "table" | "request";
  title: string;
  body: string;
  dedupeKey: string;
  createdAt: string;
  isDemo: boolean;
}

export interface TravelMatchFeedback {
  viewerId: string;
  targetId: string;
  journeyId: string;
  signal: "relevant" | "not_relevant" | "hidden";
}

export type TravelMatchKind = "local" | "fellow_traveler" | "city_host" | "meridian";

export interface TravelScoredMatch {
  viewerId: string;
  viewerJourneyId: string;
  target: ProfileRecord;
  targetJourneyId?: string;
  kind: TravelMatchKind;
  weighted: number;
  meridianScore: number;
  overlapScore: number;
  intentScore: number;
  complementaryScore: number;
  availabilityScore: number;
  explanations: MatchExplanation[];
  why: string;
  inMeridian10: boolean;
  inMeridian100: boolean;
}

export interface CrossingConversation {
  id: string;
  crossingRequestId?: string;
  tableId?: string;
  participantIds: string[];
  mode: "stream" | "demo";
  createdAt: string;
  isDemo: boolean;
}

export const CROSSINGS_COPY = {
  name: "Crossings",
  createAction: "Set Your Coordinates",
  meeting: "A Crossing",
  table: "Open a Table",
  hosts: "City Hosts",
  notes: "City Notes",
  line: "The people you should know, wherever you land.",
  support: "When your paths cross, you’ll know.",
  concierge:
    "City Hosts welcome visitors as members — never as professional concierges.",
  location:
    "City-level presence only. Crossings is not real-time location sharing.",
} as const;
