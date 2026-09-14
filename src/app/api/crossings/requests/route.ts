import { z } from "zod";
import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import { proposeCrossing, respondToCrossing } from "@/lib/crossings/service";
import { MEETING_FORMATS } from "@/lib/crossings/types";
import { viewerProfile } from "@/lib/preview/store";

const proposeSchema = z.object({
  toProfileId: z.string(),
  journeyId: z.string(),
  counterpartJourneyId: z.string().optional(),
  format: z.enum(MEETING_FORMATS),
  proposedDates: z.array(z.string()).min(1),
  note: z.string().max(280).optional(),
});

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  const viewer = viewerProfile();
  const requests = ctx.state.requests.filter(
    (r) => r.fromProfileId === viewer.id || r.toProfileId === viewer.id,
  );
  return Response.json({ ok: true, requests, demo: true });
}

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const parsed = proposeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("A Crossing needs a format and a date.");
  try {
    const viewer = viewerProfile();
    const row = proposeCrossing(ctx.state, { ...parsed.data, fromProfileId: viewer.id });
    return Response.json({ ok: true, request: row });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not send.");
  }
}

export async function PATCH(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: "accept" | "decline" | "reschedule";
    suggestedDates?: string[];
  } | null;
  if (!body?.id || !body.action) return jsonError("Missing response.");
  try {
    const viewer = viewerProfile();
    const row = respondToCrossing(ctx.state, {
      requestId: body.id,
      actorId: viewer.id,
      action: body.action,
      suggestedDates: body.suggestedDates,
    });
    return Response.json({ ok: true, request: row });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not respond.");
  }
}
