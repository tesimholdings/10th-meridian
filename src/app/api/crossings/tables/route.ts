import { z } from "zod";
import { crossingsAccess, jsonCaught, jsonError } from "@/lib/crossings/http";
import { decideTableGuest, joinTable, openTable, publicTableView, tableSuggestionsFor } from "@/lib/crossings/service";
import { MEETING_FORMATS, TABLE_JOIN_MODES } from "@/lib/crossings/types";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

const openSchema = z.object({
  city: z.string().min(2),
  country: z.string().min(2),
  neighborhood: z.string().min(2).max(80),
  venuePrivate: z.string().max(200).optional(),
  dateTime: z.string(),
  timezone: z.string(),
  mealType: z.enum(MEETING_FORMATS),
  theme: z.string().max(80).optional(),
  maxGuests: z.number().int().min(3).max(12),
  joinMode: z.enum(TABLE_JOIN_MODES),
});

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  const viewer = viewerProfile();
  const tables = ctx.state.tables.map((t) => publicTableView(t, viewer.id, ctx.role));
  const suggestions = tableSuggestionsFor(ctx.state, getPreviewStore().profiles, viewer.id);
  return Response.json({ ok: true, tables, suggestions, demo: true });
}

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const parsed = openSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("A table needs a neighborhood, a time, and room for three.");
  try {
    const viewer = viewerProfile();
    const table = openTable(ctx.state, { ...parsed.data, openedByProfileId: viewer.id });
    const channel = {
      id: table.channelId ?? `ch-table-${table.id}`,
      slug: `table-${table.id}`,
      name: `Table · ${table.city}`,
      kind: "private" as const,
      topic: `Confirmed guests only. Neighborhood: ${table.neighborhood}. DEMO.`,
      unread: 0,
      isDemo: true,
    };
    const store = getPreviewStore();
    if (!store.channels.some((c) => c.id === channel.id)) store.channels.unshift(channel);
    return Response.json({ ok: true, table });
  } catch (error) {
    return jsonCaught(error, "Could not open a table.");
  }
}

export async function PATCH(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const body = (await request.json().catch(() => null)) as {
    tableId?: string;
    action?: "join" | "decide";
    profileId?: string;
    accept?: boolean;
  } | null;
  if (!body?.tableId) return jsonError("Missing table.");
  const viewer = viewerProfile();
  try {
    if (body.action === "join") {
      return Response.json({ ok: true, table: joinTable(ctx.state, body.tableId, viewer.id) });
    }
    if (body.action === "decide" && body.profileId) {
      return Response.json({
        ok: true,
        table: decideTableGuest(ctx.state, {
          tableId: body.tableId,
          actorId: viewer.id,
          profileId: body.profileId,
          accept: Boolean(body.accept),
        }),
      });
    }
    return jsonError("Unknown action.");
  } catch (error) {
    return jsonCaught(error, "Could not update the table.");
  }
}
