import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { getPreviewStore, requestIntro, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  targetId: z.string(),
  note: z.string().max(400).optional(),
});

export async function GET() {
  return Response.json({ intros: getPreviewStore().intros });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const viewer = viewerProfile();
  const target = getPreviewStore().profiles.find((p) => p.id === parsed.data.targetId);
  if (!target) return Response.json({ ok: false, message: "Unknown profile." }, { status: 404 });
  const intro = requestIntro({
    fromId: viewer.id,
    targetId: target.id,
    fromName: viewer.displayName,
    toName: target.displayName,
    note: parsed.data.note,
  });
  return Response.json({ ok: true, intro });
}
