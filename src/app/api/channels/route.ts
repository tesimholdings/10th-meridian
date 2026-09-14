import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import {
  getPreviewStore,
  markChannelRead,
  postMessage,
  reactToMessage,
  unreadTotal,
} from "@/lib/preview/store";
import { hasStream } from "@/lib/env";

export async function GET() {
  const store = getPreviewStore();
  return Response.json({
    channels: store.channels,
    messages: store.messages,
    unread: unreadTotal(),
    stream: hasStream() ? "live-keys-present" : "stub",
  });
}

const schema = z.object({
  action: z.enum(["send", "react", "read"]),
  channelId: z.string().optional(),
  body: z.string().max(2000).optional(),
  parentId: z.string().optional(),
  messageId: z.string().optional(),
  reaction: z.string().optional(),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  if (parsed.data.action === "read" && parsed.data.channelId) {
    markChannelRead(parsed.data.channelId);
    return Response.json({ ok: true, channels: getPreviewStore().channels });
  }
  if (parsed.data.action === "react" && parsed.data.messageId && parsed.data.reaction) {
    const message = reactToMessage(
      parsed.data.messageId,
      parsed.data.reaction,
      access.user?.name ?? "A. Voss",
    );
    return Response.json({ ok: true, message });
  }
  if (parsed.data.action === "send" && parsed.data.channelId && parsed.data.body?.trim()) {
    const message = postMessage({
      channelId: parsed.data.channelId,
      body: parsed.data.body.trim(),
      parentId: parsed.data.parentId,
      authorName: access.user?.name ?? "A. Voss",
      authorInitials: (access.user?.name ?? "AV").slice(0, 2).toUpperCase(),
    });
    return Response.json({ ok: true, message, messages: getPreviewStore().messages });
  }
  return Response.json({ ok: false }, { status: 400 });
}
