import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { recordFeedback } from "@/lib/preview/store";
import { viewerDemoProfile } from "@/lib/data/demo";

const schema = z.object({
  targetId: z.string(),
  signal: z.enum(["relevant", "not_relevant", "declined", "hidden", "accepted"]),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }
  recordFeedback({
    viewerId: access.user?.id?.startsWith("preview-") ? viewerDemoProfile.id : (access.user?.id ?? viewerDemoProfile.id),
    targetId: parsed.data.targetId,
    signal: parsed.data.signal,
  });
  return Response.json({
    ok: true,
    note: "Feedback recorded in the preview store. Persists to match_feedback when Supabase is live.",
  });
}
