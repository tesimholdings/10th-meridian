import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { askTheMeridian } from "@/lib/ask/meridian";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  query: z.string().min(2).max(240),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, hits: [] }, { status: 400 });
  const viewer = viewerProfile();
  const hits = askTheMeridian(parsed.data.query, getPreviewStore().profiles, viewer.id);
  return Response.json({ ok: true, hits });
}
