import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import {
  getPreviewStore,
  housePrefsFor,
  markHouseNotificationsRead,
  setHouseNotificationPrefs,
  unreadHouseNotifications,
  viewerProfile,
} from "@/lib/preview/store";

const channelSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
});

const prefsSchema = z.object({
  action: z.literal("prefs"),
  channelJoin: channelSchema.optional(),
  circle: channelSchema.optional(),
  index: channelSchema.optional(),
  intros: channelSchema.optional(),
  events: channelSchema.optional(),
  announcements: channelSchema.optional(),
  digest: z.enum(["off", "daily", "weekly"]).optional(),
});

const readSchema = z.object({
  action: z.literal("read"),
  ids: z.array(z.string()).optional(),
});

export async function GET() {
  const viewer = viewerProfile();
  const store = getPreviewStore();
  return Response.json({
    notifications: store.houseNotifications.filter((n) => n.recipientId === viewer.id),
    unread: unreadHouseNotifications(viewer.id),
    prefs: housePrefsFor(viewer.id),
  });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const viewer = viewerProfile();
  const prefs = prefsSchema.safeParse(body);
  if (prefs.success) {
    return Response.json({
      ok: true,
      prefs: setHouseNotificationPrefs(viewer.id, {
        channelJoin: prefs.data.channelJoin,
        circle: prefs.data.circle,
        index: prefs.data.index,
        intros: prefs.data.intros,
        events: prefs.data.events,
        announcements: prefs.data.announcements,
        digest: prefs.data.digest,
      }),
    });
  }
  const read = readSchema.safeParse(body);
  if (read.success) {
    markHouseNotificationsRead(viewer.id, read.data.ids);
    return Response.json({ ok: true, unread: unreadHouseNotifications(viewer.id) });
  }
  return Response.json({ ok: false }, { status: 400 });
}
