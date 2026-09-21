import { getPreviewStore } from "@/lib/preview/store";
import { hasStream, hasWebPush } from "@/lib/env";
import { getStreamServer } from "@/lib/stream/client";
import { deliverWebPush } from "@/lib/stream/devices";
import { houseChannelBySlug } from "@/lib/stream/house";
import {
  excerpt,
  hrefForStreamChannel,
  messageHrefForSlug,
  pushRecipientIds,
  readWebhookMessage,
  resolveStreamAuthor,
  streamTargetForChannel,
} from "@/lib/stream/push-plan";
import { linkedPushUserIds, STREAM_SYSTEM_USER_ID, streamSeedRoster } from "@/lib/stream/roster";
import { ensureMessagingChannel } from "@/lib/stream/seed";

/**
 * Best-effort copy of a demo send into Stream so phone alerts can fire.
 * Does not change the demo message, channel id, or the API response.
 */
export async function relayDemoMessage(input: {
  demoChannelId: string;
  body: string;
  authorId: string;
  authorName: string;
}): Promise<void> {
  try {
    if (!hasStream()) return;
    const body = input.body.trim();
    if (!body || !input.demoChannelId) return;
    const server = getStreamServer();
    if (!server) return;

    const store = getPreviewStore();
    const channel = store.channels.find((row) => row.id === input.demoChannelId);
    if (!channel) return;
    const memberIds = store.channelMembers[channel.id] ?? [];
    const senderId = resolveStreamAuthor({
      authorId: input.authorId,
      authorName: input.authorName,
      profiles: store.profiles,
    });
    const target = streamTargetForChannel({
      slug: channel.slug,
      kind: channel.kind,
      memberIds,
    });
    if (!target || !senderId) return;

    const exclude = new Set([
      senderId,
      input.authorId,
      ...linkedPushUserIds(input.authorId),
      ...linkedPushUserIds(senderId),
      STREAM_SYSTEM_USER_ID,
    ]);
    const recipients = pushRecipientIds({
      slug: channel.slug,
      kind: channel.kind,
      memberIds,
      rosterIds: streamSeedRoster(store.profiles).map((member) => member.id),
      excludeIds: [...exclude],
    });
    const house = houseChannelBySlug(channel.slug);
    const title = house?.name ?? (channel.kind === "dm" ? "New message" : channel.name);
    const url =
      channel.kind === "dm" ? messageHrefForSlug(channel.slug, "dm") : messageHrefForSlug(channel.slug, channel.kind);

    await server.upsertUsers([
      { id: senderId, name: input.authorName || senderId },
      ...recipients.map((id) => {
        const profile = store.profiles.find((row) => row.id === id);
        return { id, name: profile?.displayName ?? id };
      }),
    ]);
    await ensureMessagingChannel(server, {
      id: target.id,
      name: house?.name ?? channel.name,
      topic: house?.topic,
      memberIds: [...new Set([senderId, ...memberIds, ...recipients])],
    });
    const sent = await server.channel("messaging", target.id).sendMessage({
      text: body,
      user_id: senderId,
      tm_web_push: "sent",
    });

    if (!hasWebPush() || !recipients.length) return;
    await deliverWebPush({
      userIds: recipients,
      payload: {
        title,
        body: `${input.authorName}: ${excerpt(body)}`,
        url: url || hrefForStreamChannel(target.id),
        tag: target.cid,
        messageId: sent.message?.id,
      },
    });
  } catch {
    // The demo send already succeeded. Push is additional.
  }
}

/** Web Push for a Stream message that this app did not already deliver. */
export async function deliverIncomingStreamMessage(body: unknown): Promise<{
  ok: true;
  skipped?: string;
  sent: number;
}> {
  const delivery = readWebhookMessage(body);
  if (!delivery) return { ok: true, skipped: "invalid", sent: 0 };
  if (delivery.skip) return { ok: true, skipped: delivery.skip, sent: 0 };
  if (!hasWebPush()) return { ok: true, skipped: "web-push-unconfigured", sent: 0 };
  const server = getStreamServer();
  if (!server || !delivery.channelId) return { ok: true, skipped: "stub", sent: 0 };
  const channel = server.channel(delivery.channelType, delivery.channelId);
  const state = await channel.query({
    watch: false,
    state: true,
    presence: false,
    messages: { limit: 0 },
    members: { limit: 100 },
  });
  const exclude = new Set(linkedPushUserIds(delivery.senderId));
  const recipients = (state.members ?? [])
    .map((member) => member.user_id || member.user?.id || "")
    .filter((id) => id && !exclude.has(id) && id !== STREAM_SYSTEM_USER_ID);
  const result = await deliverWebPush({
    userIds: recipients,
    payload: {
      title: delivery.channelName,
      body: `${delivery.senderName}: ${excerpt(delivery.text)}`,
      url: hrefForStreamChannel(delivery.channelId),
      tag: delivery.cid || delivery.channelId,
      messageId: delivery.messageId,
    },
  });
  return { ok: true, sent: result.sent };
}
