import { z } from "zod";
import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import {
  createJourney,
  deleteJourney,
  pauseJourney,
  resumeJourney,
  updateJourney,
  visibleJourneysFor,
} from "@/lib/crossings/service";
import { MEETING_FORMATS, TRAVEL_INTENTS, JOURNEY_VISIBILITY } from "@/lib/crossings/types";
import { viewerProfile } from "@/lib/preview/store";
import { demoIndexFor } from "@/lib/matching/service";

const createSchema = z.object({
  destinationCity: z.string().min(2).max(80),
  destinationCountry: z.string().min(2).max(80),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(3).max(80),
  flexibleDates: z.boolean(),
  availability: z.array(z.enum(MEETING_FORMATS)).min(1),
  intents: z.array(z.enum(TRAVEL_INTENTS)).min(1),
  privateNote: z.string().max(400).optional(),
  visibility: z.enum(JOURNEY_VISIBILITY),
  openToOneToOne: z.boolean(),
  openToGroupTable: z.boolean(),
  needsLocalRecommendation: z.boolean(),
  willingCityHost: z.boolean(),
  selectedChannelIds: z.array(z.string()).optional(),
});

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  const viewer = viewerProfile();
  const index = await demoIndexFor(viewer);
  const meridianIds = index.meridian100.map((m) => m.target.id);
  const journeys = visibleJourneysFor({
    state: ctx.state,
    viewerId: viewer.id,
    viewerRole: ctx.role,
    meridianMatchIds: meridianIds,
    sharedChannelIds: [],
  });
  return Response.json({
    ok: true,
    demo: true,
    openHouseIsolation: !ctx.isMemberAccess,
    journeys,
  });
}

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  if (!ctx.canMutate) {
    return jsonError("Active members only. Open House shows synthetic demonstration data.", 403);
  }
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Please complete the coordinates.");
  try {
    const viewer = viewerProfile();
    const journey = createJourney(ctx.state, {
      ...parsed.data,
      profileId: viewer.id,
      selectedChannelIds: parsed.data.selectedChannelIds ?? [],
    });
    return Response.json({ ok: true, journey });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save.");
  }
}

export async function PATCH(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: "pause" | "resume" | "delete" | "update";
    patch?: Record<string, unknown>;
  } | null;
  if (!body?.id) return jsonError("Missing journey.");
  const viewer = viewerProfile();
  try {
    if (body.action === "pause") return Response.json({ ok: true, journey: pauseJourney(ctx.state, body.id, viewer.id) });
    if (body.action === "resume") return Response.json({ ok: true, journey: resumeJourney(ctx.state, body.id, viewer.id) });
    if (body.action === "delete") return Response.json({ ok: true, journey: deleteJourney(ctx.state, body.id, viewer.id) });
    const journey = updateJourney(ctx.state, body.id, viewer.id, (body.patch ?? {}) as never);
    return Response.json({ ok: true, journey });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update.");
  }
}
