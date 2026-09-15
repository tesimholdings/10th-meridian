import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { hideFromIndex, reportMember, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  action: z.enum(["report", "mute"]),
  targetId: z.string().min(1),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false, message: "Members only." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, message: "Missing member." }, { status: 400 });
  const viewer = viewerProfile();
  if (parsed.data.targetId === viewer.id) {
    return Response.json({ ok: false, message: "You cannot report yourself." }, { status: 400 });
  }
  if (parsed.data.action === "mute") {
    hideFromIndex(viewer.id, parsed.data.targetId);
    return Response.json({
      ok: true,
      message: "Muted. They will no longer appear in For you.",
    });
  }
  reportMember(viewer.id, parsed.data.targetId);
  return Response.json({
    ok: true,
    message: "Reported to a steward. Preview records this locally until live operations exist.",
  });
}
