import type { ChannelRecord, EventRecord, ProfileRecord } from "@/lib/data/types";
import type { CircleEdge, MutualConnection } from "@/lib/network/types";
import { circleIdsFor } from "@/lib/network/circle";
import { messageHref } from "@/lib/messaging/destination";

export function mutualHref(item: MutualConnection): string {
  if (item.kind === "channel") return messageHref({ channelId: item.refId });
  if (item.kind === "event") return `/member/events/${item.refId}`;
  return `/member/members/${item.refId}`;
}

/**
 * People in both Circles, shared house channels (never DMs), and shared listed events.
 * Never treats the viewed member, the viewer, or a DM as a mutual person.
 */
export function mutualConnections(input: {
  viewerId: string;
  targetId: string;
  profiles: ProfileRecord[];
  circle: CircleEdge[];
  channels: ChannelRecord[];
  channelMembers: Record<string, string[]>;
  events?: EventRecord[];
}): MutualConnection[] {
  if (!input.viewerId || !input.targetId || input.viewerId === input.targetId) return [];

  const viewerCircle = new Set(circleIdsFor(input.viewerId, input.circle));
  const targetCircle = new Set(circleIdsFor(input.targetId, input.circle));
  const byId = new Map(input.profiles.map((p) => [p.id, p]));
  const out: MutualConnection[] = [];
  const seen = new Set<string>();

  for (const id of viewerCircle) {
    if (id === input.targetId || id === input.viewerId) continue;
    if (!targetCircle.has(id)) continue;
    const profile = byId.get(id);
    if (!profile || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id: `person-${id}`,
      refId: id,
      displayName: profile.displayName,
      initials: profile.initials,
      kind: "circle",
      label: `${profile.displayName}, in common in Your Circle`,
    });
  }

  for (const channel of input.channels) {
    if (channel.kind === "dm") continue;
    const members = input.channelMembers[channel.id] ?? [];
    if (!members.includes(input.viewerId) || !members.includes(input.targetId)) continue;
    const key = `channel-${channel.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const name = channel.name.startsWith("#") ? channel.name : channel.kind === "chapter" ? channel.name : `#${channel.slug}`;
    out.push({
      id: key,
      refId: channel.id,
      displayName: name,
      initials: channel.name.replace(/^#+/, "").slice(0, 2).toUpperCase(),
      kind: "channel",
      label: `Shared channel ${name}`,
    });
  }

  const viewer = byId.get(input.viewerId);
  const target = byId.get(input.targetId);
  const viewerEvents = new Set(viewer?.attendingEventIds ?? []);
  const targetEvents = new Set(target?.attendingEventIds ?? []);
  for (const event of input.events ?? []) {
    if (!viewerEvents.has(event.id) || !targetEvents.has(event.id)) continue;
    const key = `event-${event.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: key,
      refId: event.id,
      displayName: event.title,
      initials: event.city.slice(0, 2).toUpperCase() || "EV",
      kind: "event",
      label: `Shared experience ${event.title}`,
    });
  }

  return out;
}
