import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import {
  addMemberToCircle,
  getPreviewStore,
  hideFromIndex,
  removeMemberFromCircle,
  unhideFromIndex,
  viewerProfile,
} from "@/lib/preview/store";
import { isInCircle } from "@/lib/network/circle";

const schema = z.object({
  action: z.enum(["add", "remove", "remove-index", "restore-index"]),
  targetId: z.string(),
});

export async function GET() {
  const viewer = viewerProfile();
  const store = getPreviewStore();
  return Response.json({
    circle: store.circle.filter((e) => e.ownerId === viewer.id),
    indexRemovals: store.indexRemovals.filter((r) => r.viewerId === viewer.id),
  });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const viewer = viewerProfile();
  const { action, targetId } = parsed.data;

  if (action === "add") {
    const next = addMemberToCircle(viewer.id, targetId);
    return Response.json({
      ok: true,
      inCircle: isInCircle(viewer.id, targetId, next.edges),
      added: next.added,
    });
  }
  if (action === "remove") {
    const next = removeMemberFromCircle(viewer.id, targetId);
    return Response.json({ ok: true, removed: next.removed });
  }
  if (action === "remove-index") {
    const next = hideFromIndex(viewer.id, targetId);
    return Response.json({ ok: true, removed: next.removed });
  }
  const next = unhideFromIndex(viewer.id, targetId);
  return Response.json({ ok: true, restored: next.restored });
}
