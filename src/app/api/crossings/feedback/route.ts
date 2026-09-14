import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import { viewerProfile } from "@/lib/preview/store";

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const body = (await request.json().catch(() => null)) as {
    targetId?: string;
    journeyId?: string;
    signal?: "relevant" | "not_relevant" | "hidden";
  } | null;
  if (!body?.targetId || !body.journeyId || !body.signal) return jsonError("Missing feedback.");
  const viewer = viewerProfile();
  ctx.state.feedback = ctx.state.feedback.filter(
    (f) =>
      !(
        f.viewerId === viewer.id &&
        f.targetId === body.targetId &&
        f.journeyId === body.journeyId &&
        f.signal === body.signal
      ),
  );
  ctx.state.feedback.push({
    viewerId: viewer.id,
    targetId: body.targetId,
    journeyId: body.journeyId,
    signal: body.signal,
  });
  return Response.json({ ok: true });
}
