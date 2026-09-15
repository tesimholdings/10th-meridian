import { z } from "zod";
import { crossingsAccess, jsonCaught, jsonError } from "@/lib/crossings/http";
import { addCityNote, moderateCityNote, reportCityNote, saveCityNote, visibleCityNotes } from "@/lib/crossings/service";
import { CITY_NOTE_KINDS } from "@/lib/crossings/types";
import { viewerProfile } from "@/lib/preview/store";

const createSchema = z.object({
  city: z.string().min(2),
  country: z.string().min(2),
  kind: z.enum(CITY_NOTE_KINDS),
  title: z.string().min(3).max(120),
  body: z.string().min(8).max(800),
  neighborhood: z.string().max(80).optional(),
});

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  return Response.json({
    ok: true,
    notes: visibleCityNotes(ctx.state, ctx.isMemberAccess),
    demo: true,
    openHouseIsolation: !ctx.isMemberAccess,
  });
}

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only. City Notes are never shown at Open House as real data.", 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("A City Note needs a title and a careful sentence.");
  try {
    const viewer = viewerProfile();
    const note = addCityNote(ctx.state, { ...parsed.data, authorProfileId: viewer.id });
    return Response.json({ ok: true, note });
  } catch (error) {
    return jsonCaught(error, "Could not save.");
  }
}

export async function PATCH(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: "save" | "report" | "hide" | "show";
    reason?: string;
  } | null;
  if (!body?.id || !body.action) return jsonError("Missing note.");
  const viewer = viewerProfile();
  try {
    if (body.action === "save") {
      if (!ctx.canMutate) return jsonError("Active members only.", 403);
      return Response.json({ ok: true, note: saveCityNote(ctx.state, body.id, viewer.id) });
    }
    if (body.action === "report") {
      if (!ctx.canMutate) return jsonError("Active members only.", 403);
      return Response.json({
        ok: true,
        note: reportCityNote(ctx.state, body.id, viewer.id, body.reason ?? "reported"),
      });
    }
    if (ctx.role !== "administrator" && ctx.role !== "moderator") {
      return jsonError("Stewards moderate City Notes.", 403);
    }
    return Response.json({
      ok: true,
      note: moderateCityNote(ctx.state, body.id, body.action === "hide"),
    });
  } catch (error) {
    return jsonCaught(error, "Could not update.");
  }
}
