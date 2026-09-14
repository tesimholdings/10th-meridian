import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { registerForEvent, viewerProfile } from "@/lib/preview/store";

const schema = z.object({ eventId: z.string() });

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const result = registerForEvent(parsed.data.eventId, viewerProfile().accountId);
  if (!result.ok) return Response.json(result, { status: 404 });
  return Response.json(result);
}
