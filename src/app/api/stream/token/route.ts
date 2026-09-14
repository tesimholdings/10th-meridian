import { resolveAccessContext } from "@/lib/access/context";
import { getStreamServer } from "@/lib/stream/client";
import { env } from "@/lib/env";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && !access.decision.allowed) {
    return Response.json({ ok: false, message: "Members only." }, { status: 403 });
  }
  const stream = getStreamServer();
  if (!stream || !access.user) {
    return Response.json({
      ok: true,
      stub: true,
      apiKey: env.streamApiKey || null,
      token: null,
      note: "Stream token issuance is stubbed until STREAM_API_SECRET is set.",
    });
  }
  const token = stream.createToken(access.user.id);
  return Response.json({ ok: true, stub: false, token, apiKey: env.streamApiKey });
}
