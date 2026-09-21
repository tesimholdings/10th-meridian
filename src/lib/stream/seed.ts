import type { StreamChat } from "stream-chat";
import { streamChannelCid } from "@/lib/stream/channels";
import { getStreamServer } from "@/lib/stream/client";
import { houseChannelCatalog, type HouseChannelSpec } from "@/lib/stream/house";
import {
  STREAM_SESSION_USERS,
  STREAM_SYSTEM_USER_ID,
  streamSeedRoster,
  type StreamMember,
} from "@/lib/stream/roster";

export type SeededChannel = HouseChannelSpec & {
  seeded: boolean;
  error?: string;
};

export type SeedResult = {
  ok: boolean;
  stub: boolean;
  channels: SeededChannel[];
  memberIds: string[];
  note?: string;
};

const globalSeed = globalThis as { __tmStreamSeed?: Promise<SeedResult> | null };

function dedupeMembers(members: StreamMember[]): StreamMember[] {
  const seen = new Set<string>();
  const out: StreamMember[] = [];
  for (const member of members) {
    if (!member.id || seen.has(member.id)) continue;
    seen.add(member.id);
    out.push(member);
  }
  return out;
}

async function upsertMembers(server: StreamChat, members: StreamMember[]) {
  const users = members.map((member) => ({ id: member.id, name: member.name }));
  for (let i = 0; i < users.length; i += 100) {
    await server.upsertUsers(users.slice(i, i + 100));
  }
}

export async function ensureMessagingChannel(
  server: StreamChat,
  input: {
    id: string;
    name: string;
    topic?: string;
    memberIds: string[];
    createdById?: string;
  },
): Promise<{ id: string; cid: string }> {
  const createdById = input.createdById ?? STREAM_SYSTEM_USER_ID;
  const memberIds = [...new Set(input.memberIds.filter((id) => id && id !== STREAM_SYSTEM_USER_ID))];
  const channel = server.channel("messaging", input.id, {
    name: input.name,
    topic: input.topic,
    created_by_id: createdById,
    members: memberIds.slice(0, 100),
  });
  await channel.create();
  for (let i = 0; i < memberIds.length; i += 100) {
    const slice = memberIds.slice(i, i + 100);
    if (!slice.length) continue;
    try {
      await channel.addMembers(slice);
    } catch {
      // Re-seed is safe when members are already in the room.
    }
  }
  try {
    await channel.updatePartial({
      set: input.topic ? { name: input.name, topic: input.topic } : { name: input.name },
    });
  } catch {
    // Name refresh is optional. Membership is what push needs.
  }
  return { id: input.id, cid: streamChannelCid("messaging", input.id) };
}

export async function seedHouseChannels(): Promise<SeedResult> {
  const catalog = houseChannelCatalog();
  const roster = streamSeedRoster();
  const members = dedupeMembers([
    { id: STREAM_SYSTEM_USER_ID, name: "10th Meridian" },
    ...roster,
    ...STREAM_SESSION_USERS,
  ]);
  const memberIds = members.map((member) => member.id).filter((id) => id !== STREAM_SYSTEM_USER_ID);
  const server = getStreamServer();
  if (!server) {
    return {
      ok: true,
      stub: true,
      channels: catalog.map((channel) => ({ ...channel, seeded: false })),
      memberIds,
      note: "Stream keys are not set. Channel ids are ready; nothing was created.",
    };
  }

  try {
    await upsertMembers(server, members);
  } catch (error) {
    return {
      ok: false,
      stub: false,
      channels: catalog.map((channel) => ({
        ...channel,
        seeded: false,
        error: errorMessage(error),
      })),
      memberIds,
      note: "Stream rejected the member upsert.",
    };
  }

  const channels: SeededChannel[] = [];
  for (const channel of catalog) {
    try {
      const ensured = await ensureMessagingChannel(server, {
        id: channel.id,
        name: channel.name,
        topic: channel.topic,
        memberIds,
      });
      channels.push({ ...channel, cid: ensured.cid, seeded: true });
    } catch (error) {
      channels.push({ ...channel, seeded: false, error: errorMessage(error) });
    }
  }
  const ok = channels.every((channel) => channel.seeded);
  return {
    ok,
    stub: false,
    channels,
    memberIds,
    note: ok ? "House channels are ready." : "Some house channels could not be seeded.",
  };
}

/** First live member session may seed. A stub result is not cached. */
export function ensureHouseSeeded(): Promise<SeedResult> {
  if (globalSeed.__tmStreamSeed) return globalSeed.__tmStreamSeed;
  const run = seedHouseChannels()
    .then((result) => {
      if (result.stub || !result.ok) globalSeed.__tmStreamSeed = null;
      return result;
    })
    .catch((error) => {
      globalSeed.__tmStreamSeed = null;
      throw error;
    });
  globalSeed.__tmStreamSeed = run;
  return run;
}

export async function reseedHouseChannels(): Promise<SeedResult> {
  const result = await seedHouseChannels();
  globalSeed.__tmStreamSeed = result.stub || !result.ok ? null : Promise.resolve(result);
  return result;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.slice(0, 240);
  return "Stream request failed.";
}
