import { createHmac, timingSafeEqual } from "node:crypto";
import { demoChannels } from "@/lib/data/demo";
import { directMessageChannelId, streamChannelCid } from "@/lib/stream/channels";
import { houseChannelBySlug, isHouseChannelSlug } from "@/lib/stream/house";
import { PREVIEW_MEMBER_SESSION_ID, STREAM_SYSTEM_USER_ID } from "@/lib/stream/roster";

export function webPushSubject(raw: string): string {
  const value = raw.trim();
  if (!value) return "mailto:team@tenmeridian.com";
  if (value.startsWith("mailto:") || value.startsWith("https://")) return value;
  if (value.includes("@")) return `mailto:${value}`;
  return "mailto:team@tenmeridian.com";
}

export function verifyStreamWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  const presented = signature.trim().replace(/^sha256=/i, "");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const left = Buffer.from(presented, "hex");
    const right = Buffer.from(expected, "hex");
    if (left.length === 0 || left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function resolveStreamAuthor(input: {
  authorId: string;
  authorName: string;
  profiles: { id: string; displayName: string }[];
}): string {
  const byId = input.profiles.find((profile) => profile.id === input.authorId);
  if (byId) return byId.id;
  const name = input.authorName.trim();
  const byName = input.profiles.find((profile) => profile.displayName === name);
  if (byName) return byName.id;
  return input.authorId;
}

export function streamTargetForChannel(input: {
  slug: string;
  kind: string;
  memberIds: string[];
}): { id: string; cid: string } | null {
  const house = houseChannelBySlug(input.slug);
  if (house) return { id: house.id, cid: house.cid };
  if (input.kind !== "dm") return null;
  const unique = [...new Set(input.memberIds.filter(Boolean))];
  if (unique.length < 2) return null;
  const id = directMessageChannelId(unique[0], unique[1]);
  return { id, cid: streamChannelCid("messaging", id) };
}

export function pushRecipientIds(input: {
  slug: string;
  kind: string;
  memberIds: string[];
  rosterIds: string[];
  excludeIds: string[];
}): string[] {
  const exclude = new Set(input.excludeIds.filter(Boolean));
  const listed = [...new Set(input.memberIds.filter(Boolean))];
  const base = listed.length > 0 ? listed : isHouseChannelSlug(input.slug) ? input.rosterIds : [];
  const expanded = new Set<string>();
  for (const id of base) {
    if (!id || exclude.has(id) || id === STREAM_SYSTEM_USER_ID) continue;
    expanded.add(id);
    if (id === "demo-01") expanded.add(PREVIEW_MEMBER_SESSION_ID);
  }
  for (const id of exclude) expanded.delete(id);
  return [...expanded];
}

export function messageHrefForSlug(slug: string, kind: string): string {
  if (kind === "dm") return "/member/messages";
  const demo = demoChannels.find((channel) => channel.slug === slug);
  if (!demo) return "/member/messages";
  return `/member/messages?channel=${encodeURIComponent(demo.id)}`;
}

export function hrefForStreamChannel(channelId: string): string {
  if (channelId.startsWith("channel-")) {
    return messageHrefForSlug(channelId.slice("channel-".length), "house");
  }
  return "/member/messages";
}

export function excerpt(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}

export type WebhookDelivery = {
  skip: null | "not-message" | "relayed" | "empty" | "system";
  text: string;
  senderId: string;
  senderName: string;
  channelId: string;
  channelType: string;
  channelName: string;
  messageId: string;
  cid: string;
};

export function readWebhookMessage(body: unknown): WebhookDelivery | null {
  if (!body || typeof body !== "object") return null;
  const event = body as {
    type?: unknown;
    cid?: unknown;
    channel_id?: unknown;
    channel_type?: unknown;
    message?: {
      id?: unknown;
      text?: unknown;
      user?: { id?: unknown; name?: unknown } | null;
      tm_web_push?: unknown;
    };
    user?: { id?: unknown; name?: unknown };
  };
  if (event.type !== "message.new") {
    return {
      skip: "not-message",
      text: "",
      senderId: "",
      senderName: "",
      channelId: "",
      channelType: "",
      channelName: "",
      messageId: "",
      cid: "",
    };
  }
  const senderId = stringOf(event.message?.user?.id) || stringOf(event.user?.id);
  const senderName = stringOf(event.message?.user?.name) || stringOf(event.user?.name) || "Member";
  const text = stringOf(event.message?.text);
  const channelId = stringOf(event.channel_id);
  const channelType = stringOf(event.channel_type) || "messaging";
  const house = channelId ? houseChannelByIdSafe(channelId) : undefined;
  const delivery: WebhookDelivery = {
    skip: null,
    text,
    senderId,
    senderName,
    channelId,
    channelType,
    channelName: house?.name ?? "Message",
    messageId: stringOf(event.message?.id),
    cid: stringOf(event.cid) || (channelId ? `${channelType}:${channelId}` : ""),
  };
  if (event.message?.tm_web_push === "sent") delivery.skip = "relayed";
  else if (!text) delivery.skip = "empty";
  else if (!senderId || senderId === STREAM_SYSTEM_USER_ID) delivery.skip = "system";
  return delivery;
}

function houseChannelByIdSafe(id: string) {
  if (!id.startsWith("channel-")) return undefined;
  return houseChannelBySlug(id.slice("channel-".length));
}

function stringOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}
