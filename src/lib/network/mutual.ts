import type { ChannelRecord, ProfileRecord } from "@/lib/data/types";
import type { CircleEdge, MutualConnection } from "@/lib/network/types";
import { circleIdsFor } from "@/lib/network/circle";

export function mutualConnections(input: {
  viewerId: string;
  targetId: string;
  profiles: ProfileRecord[];
  circle: CircleEdge[];
  channels: ChannelRecord[];
  channelMembers: Record<string, string[]>;
}): MutualConnection[] {
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
      id,
      displayName: profile.displayName,
      initials: profile.initials,
      kind: "circle",
      label: "In common · Your Circle",
    });
  }

  for (const channel of input.channels) {
    const members = input.channelMembers[channel.id] ?? [];
    if (!members.includes(input.viewerId) || !members.includes(input.targetId)) continue;
    out.push({
      id: `ch-${channel.id}`,
      displayName: channel.name,
      initials: channel.name.slice(0, 2).toUpperCase(),
      kind: "channel",
      label: `In common · ${channel.name}`,
    });
  }

  return out;
}
