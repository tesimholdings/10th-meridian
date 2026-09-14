import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { viewerDemoProfile } from "@/lib/data/demo";
import { invalidateAskCache } from "@/lib/matching/ask/service";
import { recordAskFeedback, recordFeedback, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  askId: z.string(),
  targetId: z.string(),
  signal: z.enum(["relevant", "not_relevant", "hidden", "saved"]),
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
  const viewer = viewerProfile();
  const viewerId = access.user?.id?.startsWith("preview-")
    ? viewerDemoProfile.id
    : (access.user?.id ?? viewer.id);
  recordAskFeedback({
    askId: parsed.data.askId,
    viewerId,
    targetId: parsed.data.targetId,
    signal: parsed.data.signal,
  });
  if (parsed.data.signal === "relevant" || parsed.data.signal === "not_relevant" || parsed.data.signal === "hidden") {
    recordFeedback({
      viewerId,
      targetId: parsed.data.targetId,
      signal: parsed.data.signal === "hidden" ? "hidden" : parsed.data.signal,
    });
  }
  invalidateAskCache(viewerId);
  return Response.json({
    ok: true,
    note: "Recorded. Relevant / not relevant feeds the behavioral layer.",
  });
}
