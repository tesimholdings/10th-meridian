import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { env, hasStream, hasWebPush } from "@/lib/env";
import {
  clearWebPush,
  forgetPushCookie,
  joinHouseForUser,
  readPushCookie,
  rememberPushCookie,
  saveWebPushSubscription,
} from "@/lib/stream/devices";
import { sessionPushUserIds } from "@/lib/stream/roster";

export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["join", "register", "unregister"]).optional(),
  subscription: z
    .object({
      endpoint: z.string().min(8).max(2000),
      keys: z.object({
        p256dh: z.string().min(1).max(255),
        auth: z.string().min(1).max(255),
      }),
    })
    .optional(),
  deviceToken: z.string().min(8).max(4096).optional(),
  pushProvider: z.enum(["firebase", "apn"]).optional(),
});

function canRegister(role: string | undefined) {
  return role === "member" || role === "moderator" || role === "administrator";
}

export async function GET() {
  const access = await resolveAccessContext();
  if (!canRegister(access.user?.role) || !access.user) {
    return Response.json({ ok: false, message: "Members only." }, { status: 403 });
  }
  const live = hasStream();
  const webPush = live && hasWebPush();
  return Response.json({
    ok: true,
    stream: live,
    webPush,
    publicKey: webPush ? env.webPushPublicKey : null,
    firebasePush: live && env.streamFirebasePush,
    pushProviderName: env.streamPushProviderName,
    selfIds: sessionPushUserIds(access.user.id),
    userId: access.user.id,
    name: access.user.name,
  });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!canRegister(access.user?.role) || !access.user?.id) {
    return Response.json({ ok: false, message: "Members only." }, { status: 403 });
  }
  if (!hasStream()) {
    return Response.json({
      ok: true,
      stub: true,
      note: "Push registration waits for NEXT_PUBLIC_STREAM_API_KEY and STREAM_API_SECRET.",
    });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const action = parsed.data.action ?? "register";
  const userIds = sessionPushUserIds(access.user.id);

  if (action === "unregister") {
    const saved = await readPushCookie();
    await clearWebPush({
      userIds,
      endpoint: parsed.data.subscription?.endpoint ?? saved?.endpoint,
      deviceToken: parsed.data.deviceToken ?? saved?.deviceToken,
    });
    await forgetPushCookie();
    return Response.json({ ok: true, stub: false });
  }

  try {
    await joinHouseForUser({ id: access.user.id, name: access.user.name });
  } catch {
    // Membership can be repaired by the steward seed route.
  }

  const subscription = parsed.data.subscription
    ? {
        endpoint: parsed.data.subscription.endpoint,
        p256dh: parsed.data.subscription.keys.p256dh,
        auth: parsed.data.subscription.keys.auth,
      }
    : undefined;

  if (action === "join" || (!subscription && !parsed.data.deviceToken)) {
    return Response.json({ ok: true, stub: false, joined: true, webPush: hasWebPush() });
  }

  try {
    const saved = await saveWebPushSubscription({
      userIds,
      name: access.user.name,
      subscription,
      deviceToken: parsed.data.deviceToken,
      pushProvider: parsed.data.pushProvider,
    });
    await rememberPushCookie({
      endpoint: subscription?.endpoint,
      deviceToken: parsed.data.deviceToken,
      pushProvider: parsed.data.pushProvider,
    });
    return Response.json({ ok: true, stub: false, joined: true, ...saved });
  } catch {
    return Response.json({ ok: false, message: "Push registration failed." }, { status: 502 });
  }
}
