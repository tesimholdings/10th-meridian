import type { ChannelRecord, ProfileRecord } from "@/lib/data/types";

export const LAST_DM_STORAGE_KEY = "tm-last-dm-destination";

export interface DestinationRequest {
  channelId?: string | null;
  profileId?: string | null;
}

export interface ResolvedDestination {
  status: "ok" | "unavailable" | "inbox";
  channel?: ChannelRecord;
  peer?: ProfileRecord;
  headerName: string;
  headerDetail: string;
  canCompose: boolean;
  message?: string;
}

function membersOf(channelId: string, channelMembers: Record<string, string[]>): string[] {
  return channelMembers[channelId] ?? [];
}

export function findDirectMessage(input: {
  fromId: string;
  toId: string;
  channels: ChannelRecord[];
  channelMembers: Record<string, string[]>;
}): ChannelRecord | undefined {
  return input.channels.find(
    (c) =>
      c.kind === "dm" &&
      membersOf(c.id, input.channelMembers).includes(input.fromId) &&
      membersOf(c.id, input.channelMembers).includes(input.toId),
  );
}

export function peerForDm(input: {
  channel: ChannelRecord;
  viewerId: string;
  profiles: ProfileRecord[];
  channelMembers: Record<string, string[]>;
}): ProfileRecord | undefined {
  const ids = membersOf(input.channel.id, input.channelMembers);
  const peerId = ids.find((id) => id !== input.viewerId);
  return input.profiles.find((p) => p.id === peerId);
}

/**
 * Opening Message from a profile/Index must resolve THAT member's DM.
 * Never silently fall back to #introductions or another public channel.
 */
export function resolveMessageDestination(input: {
  request: DestinationRequest;
  viewerId: string;
  channels: ChannelRecord[];
  channelMembers: Record<string, string[]>;
  profiles: ProfileRecord[];
}): ResolvedDestination {
  const channelId = input.request.channelId?.trim() || "";
  const profileId = input.request.profileId?.trim() || "";

  if (!channelId && !profileId) {
    return {
      status: "inbox",
      headerName: "Messages",
      headerDetail: "Choose a conversation",
      canCompose: false,
    };
  }

  if (profileId) {
    if (profileId === input.viewerId) {
      return unavailable("You cannot message yourself.");
    }
    const peer = input.profiles.find((p) => p.id === profileId);
    if (!peer) {
      return unavailable("That member is unavailable. Retry or return to their profile.");
    }
    const channel =
      (channelId ? input.channels.find((c) => c.id === channelId) : undefined) ??
      findDirectMessage({
        fromId: input.viewerId,
        toId: profileId,
        channels: input.channels,
        channelMembers: input.channelMembers,
      });
    if (!channel || channel.kind !== "dm") {
      return {
        status: "unavailable",
        peer,
        headerName: peer.displayName,
        headerDetail: `${peer.city} · conversation unavailable`,
        canCompose: false,
        message: `A private message with ${peer.displayName} could not load. Retry — this is not #introductions.`,
      };
    }
    const confirmed = peerForDm({
      channel,
      viewerId: input.viewerId,
      profiles: input.profiles,
      channelMembers: input.channelMembers,
    });
    if (!confirmed || confirmed.id !== peer.id) {
      return {
        status: "unavailable",
        peer,
        headerName: peer.displayName,
        headerDetail: "Destination could not be confirmed",
        canCompose: false,
        message: `This conversation is not with ${peer.displayName}. Sending is disabled.`,
      };
    }
    return {
      status: "ok",
      channel,
      peer: confirmed,
      headerName: confirmed.displayName,
      headerDetail: `${confirmed.city} · private message`,
      canCompose: true,
    };
  }

  const channel = input.channels.find((c) => c.id === channelId);
  if (!channel) {
    return unavailable("That conversation is unavailable. Retry from the member’s profile.");
  }
  if (channel.kind === "dm") {
    const peer = peerForDm({
      channel,
      viewerId: input.viewerId,
      profiles: input.profiles,
      channelMembers: input.channelMembers,
    });
    if (!peer) {
      return {
        status: "unavailable",
        channel,
        headerName: channel.name,
        headerDetail: "Recipient unknown",
        canCompose: false,
        message: "The recipient could not be identified. Sending is disabled until this conversation loads.",
      };
    }
    return {
      status: "ok",
      channel,
      peer,
      headerName: peer.displayName,
      headerDetail: `${peer.city} · private message`,
      canCompose: true,
    };
  }

  return {
    status: "ok",
    channel,
    headerName: channel.name.startsWith("#") ? channel.name : `#${channel.slug}`,
    headerDetail: channel.topic,
    canCompose: channel.kind !== "broadcast",
  };
}

function unavailable(message: string): ResolvedDestination {
  return {
    status: "unavailable",
    headerName: "Conversation unavailable",
    headerDetail: "Private message did not load",
    canCompose: false,
    message,
  };
}

export function messageHref(input: { profileId?: string; channelId?: string }): string {
  const params = new URLSearchParams();
  if (input.profileId) params.set("to", input.profileId);
  if (input.channelId) params.set("channel", input.channelId);
  const q = params.toString();
  return q ? `/member/messages?${q}` : "/member/messages";
}

export function persistDestination(href: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LAST_DM_STORAGE_KEY, href);
}

export function readPersistedDestination(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(LAST_DM_STORAGE_KEY);
}
