import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { addGalleryPhoto, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  caption: z.string().max(160).optional(),
  kind: z.enum(["work", "portfolio"]).optional(),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const viewer = viewerProfile();
  const photo = addGalleryPhoto(viewer.id, {
    caption: parsed.data.caption ?? "Untitled work — DEMO",
    kind: parsed.data.kind,
  });
  return Response.json({
    ok: true,
    photo,
    note: "Storage stub. Live uploads write to the portfolio bucket. SYNTHETIC DEMO.",
  });
}
