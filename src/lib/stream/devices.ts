import { cookies } from "next/headers";
import { sendNotification, setVapidDetails, WebPushError } from "web-push";
import type { PushProvider } from "stream-chat";
import { cookieOptions, readSigned, signedValue } from "@/lib/access/cookies";
import { getSessionUser } from "@/lib/access/session";
import { env, hasStream, hasWebPush } from "@/lib/env";
import { webPushSubject } from "@/lib/stream/push-plan";
import {
  dropWebPush,
  mergeWebPush,
  parseStoredWebPush,
  type StoredWebPush,
} from "@/lib/stream/push-shared";
import { getStreamServer } from "@/lib/stream/client";
import { houseChannelCatalog } from "@/lib/stream/house";
import { sessionPushUserIds, STREAM_SYSTEM_USER_ID } from "@/lib/stream/roster";
import { ensureHouseSeeded } from "@/lib/stream/seed";

export const PUSH_DEVICE_COOKIE = "tm_push_device";

type PushCookie = {
  endpoint?: string;
  deviceToken?: string;
  pushProvider?: PushProvider;
};

export async function joinHouseForUser(user: { id: string; name: string }): Promise<boolean> {
  const server = getStreamServer();
  if (!server || !user.id) return false;
  await ensureHouseSeeded();
  await server.upsertUsers([{ id: user.id, name: user.name || user.id }]);
  for (const channel of houseChannelCatalog()) {
    const room = server.channel("messaging", channel.id, {
      name: channel.name,
      created_by_id: STREAM_SYSTEM_USER_ID,
    });
    try {
      await room.addMembers([user.id]);
    } catch {
      // Channel may still be appearing, or the user is already a member.
    }
  }
  return true;
}

export async function saveWebPushSubscription(input: {
  userIds: string[];
  name: string;
  subscription?: StoredWebPush;
  deviceToken?: string;
  pushProvider?: PushProvider;
}): Promise<{ webPush: boolean; device: boolean }> {
  const server = getStreamServer();
  if (!server) return { webPush: false, device: false };
  const ids = [...new Set(input.userIds.filter(Boolean))];
  if (!ids.length) return { webPush: false, device: false };
  await server.upsertUsers(ids.map((id) => ({ id, name: input.name || id })));

  let webPush = false;
  if (input.subscription && hasWebPush()) {
    const current = await readSubscriptions(ids);
    if (current) {
      for (const id of ids) {
        const next = mergeWebPush(current.get(id) ?? [], input.subscription);
        await server.partialUpdateUser({ id, set: { tm_web_push: next } });
      }
      webPush = true;
    }
  }

  let device = false;
  if (input.deviceToken && input.pushProvider) {
    for (const id of ids) {
      await server.addDevice(
        input.deviceToken,
        input.pushProvider,
        id,
        env.streamPushProviderName || undefined,
      );
    }
    device = true;
  }
  return { webPush, device };
}

export async function deliverWebPush(input: {
  userIds: string[];
  payload: {
    title: string;
    body: string;
    url: string;
    tag: string;
    messageId?: string;
  };
  excludeEndpoints?: string[];
}): Promise<{ sent: number; removed: number }> {
  if (!hasStream() || !hasWebPush()) return { sent: 0, removed: 0 };
  const server = getStreamServer();
  if (!server) return { sent: 0, removed: 0 };
  const ids = [...new Set(input.userIds.filter(Boolean))];
  if (!ids.length) return { sent: 0, removed: 0 };
  const byUser = await readSubscriptions(ids);
  if (!byUser) return { sent: 0, removed: 0 };
  const exclude = new Set(input.excludeEndpoints ?? []);
  const seen = new Set<string>();
  const jobs: { userId: string; sub: StoredWebPush }[] = [];
  for (const [userId, subs] of byUser) {
    for (const sub of subs) {
      if (exclude.has(sub.endpoint) || seen.has(sub.endpoint)) continue;
      seen.add(sub.endpoint);
      jobs.push({ userId, sub });
    }
  }
  if (!jobs.length) return { sent: 0, removed: 0 };

  setVapidDetails(webPushSubject(env.webPushSubject), env.webPushPublicKey, env.webPushPrivateKey);
  const payload = JSON.stringify(input.payload);
  let sent = 0;
  const stale = new Map<string, Set<string>>();
  await Promise.all(
    jobs.map(async (job) => {
      try {
        await sendNotification(
          {
            endpoint: job.sub.endpoint,
            keys: { p256dh: job.sub.p256dh, auth: job.sub.auth },
          },
          payload,
        );
        sent += 1;
      } catch (error) {
        const status = error instanceof WebPushError ? error.statusCode : 0;
        if (status === 404 || status === 410) {
          const set = stale.get(job.userId) ?? new Set<string>();
          set.add(job.sub.endpoint);
          stale.set(job.userId, set);
        }
      }
    }),
  );

  let removed = 0;
  for (const [userId, endpoints] of stale) {
    const next = (byUser.get(userId) ?? []).filter((sub) => !endpoints.has(sub.endpoint));
    removed += endpoints.size;
    try {
      await server.partialUpdateUser({ id: userId, set: { tm_web_push: next } });
    } catch {
      // A stale subscription can be removed on the next register.
    }
  }
  return { sent, removed };
}

export async function clearWebPush(input: {
  userIds: string[];
  endpoint?: string;
  deviceToken?: string;
}): Promise<void> {
  const server = getStreamServer();
  if (!server) return;
  const ids = [...new Set(input.userIds.filter(Boolean))];
  if (input.endpoint) {
    const current = await readSubscriptions(ids);
    if (current) {
      for (const id of ids) {
        const next = dropWebPush(current.get(id) ?? [], input.endpoint);
        try {
          await server.partialUpdateUser({ id, set: { tm_web_push: next } });
        } catch {
          // Sign-out still proceeds.
        }
      }
    }
  }
  if (input.deviceToken) {
    for (const id of ids) {
      try {
        await server.removeDevice(input.deviceToken, id);
      } catch {
        // Device may already be gone.
      }
    }
  }
}

export async function rememberPushCookie(value: PushCookie) {
  const jar = await cookies();
  if (!value.endpoint && !value.deviceToken) {
    jar.delete(PUSH_DEVICE_COOKIE);
    return;
  }
  jar.set(PUSH_DEVICE_COOKIE, signedValue(JSON.stringify(value)), {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function readPushCookie(): Promise<PushCookie | null> {
  const jar = await cookies();
  const raw = readSigned(jar.get(PUSH_DEVICE_COOKIE)?.value);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PushCookie;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function forgetPushCookie() {
  const jar = await cookies();
  jar.delete(PUSH_DEVICE_COOKIE);
}

/** Called from sign-out while the member session is still present. */
export async function unregisterCurrentPushDevice() {
  const user = await getSessionUser();
  const saved = await readPushCookie();
  await forgetPushCookie();
  if (!user?.id || !hasStream() || !saved) return;
  try {
    await clearWebPush({
      userIds: sessionPushUserIds(user.id),
      endpoint: saved.endpoint,
      deviceToken: saved.deviceToken,
    });
  } catch {
    // Leaving the house should not depend on Stream.
  }
}

async function readSubscriptions(ids: string[]): Promise<Map<string, StoredWebPush[]> | null> {
  const server = getStreamServer();
  if (!server || !ids.length) return new Map();
  try {
    const response = await server.queryUsers(
      { id: { $in: ids } } as Parameters<typeof server.queryUsers>[0],
      {},
      { limit: Math.min(ids.length, 100) },
    );
    const map = new Map<string, StoredWebPush[]>();
    for (const user of response.users ?? []) {
      map.set(user.id, parseStoredWebPush(user.tm_web_push));
    }
    return map;
  } catch {
    return null;
  }
}
