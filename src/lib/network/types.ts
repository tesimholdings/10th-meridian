export interface ProfilePhoto {
  id: string;
  url: string;
  caption: string;
  kind: "work" | "portfolio";
  isDemo: boolean;
}

export interface ProfilePrivacy {
  /** Optional fields. Core identity (name, role, org, city) stays visible to members. */
  website: boolean;
  linkedin: boolean;
  socials: boolean;
  gallery: boolean;
  offers: boolean;
  needs: boolean;
  strengths: boolean;
  events: boolean;
}

export const DEFAULT_PROFILE_PRIVACY: ProfilePrivacy = {
  website: true,
  linkedin: true,
  socials: true,
  gallery: true,
  offers: true,
  needs: true,
  strengths: true,
  events: true,
};

export interface CircleEdge {
  ownerId: string;
  memberId: string;
  addedAt: string;
}

export interface IndexRemoval {
  viewerId: string;
  targetId: string;
  removedAt: string;
}

export type HouseNotificationKind =
  | "channel_join"
  | "circle_add"
  | "index_add"
  | "intro"
  | "event"
  | "announcement"
  | "crossing";

export interface HouseNotification {
  id: string;
  recipientId: string;
  kind: HouseNotificationKind;
  title: string;
  body: string;
  href?: string;
  actorId?: string;
  actorName?: string;
  actorInitials?: string;
  read: boolean;
  createdAt: string;
  isDemo: boolean;
}

export type NotifyChannel = {
  inApp: boolean;
  email: boolean;
};

export interface HouseNotificationPrefs {
  profileId: string;
  channelJoin: NotifyChannel;
  circle: NotifyChannel;
  index: NotifyChannel;
  intros: NotifyChannel;
  events: NotifyChannel;
  announcements: NotifyChannel;
  digest: "off" | "daily" | "weekly";
}

export const DEFAULT_HOUSE_NOTIFICATION_PREFS: Omit<HouseNotificationPrefs, "profileId"> = {
  channelJoin: { inApp: true, email: false },
  circle: { inApp: true, email: true },
  index: { inApp: true, email: false },
  intros: { inApp: true, email: true },
  events: { inApp: true, email: true },
  announcements: { inApp: true, email: true },
  digest: "weekly",
};

export interface MutualConnection {
  id: string;
  displayName: string;
  initials: string;
  kind: "circle" | "channel";
  label: string;
}

export type NetworkSource = "algorithmic" | "circle" | "human_curated";
