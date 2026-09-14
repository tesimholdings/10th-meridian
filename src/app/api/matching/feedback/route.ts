import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { invalidateMatchCache } from "@/lib/matching/service";

const schema = z.object({
  targetId: z.string(),
  signal: z.enum(["relevant", "not_relevant", "declined", "hidden", "accepted"]),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }
  invalidateMatchCache(access.user?.id);
  return Response.json({
    ok: true,
    note: "Feedback recorded in-process for preview. Persists to match_feedback when Supabase is live.",
  });
}
