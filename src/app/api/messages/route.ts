import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { getPreviewStore, openDirectMessage, viewerProfile } from "@/lib/preview/store";
import { messageHref } from "@/lib/messaging/destination";
import { hasStream } from "@/lib/env";

const schema = z.object({
  targetId: z.string(),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const viewer = viewerProfile();
  if (parsed.data.targetId === viewer.id) {
    return Response.json({ ok: false, message: "You cannot message yourself." }, { status: 400 });
  }
  const channel = openDirectMessage(viewer.id, parsed.data.targetId);
  return Response.json({
    ok: true,
    channel,
    stream: hasStream() ? "live-keys-present" : "stub",
    href: messageHref({ profileId: parsed.data.targetId, channelId: channel.id }),
  });
}

export async function GET() {
  const viewer = viewerProfile();
  const store = getPreviewStore();
  const dms = store.channels.filter(
    (c) => c.kind === "dm" && (store.channelMembers[c.id] ?? []).includes(viewer.id),
  );
  return Response.json({ channels: dms, stream: hasStream() ? "live-keys-present" : "stub" });
}
