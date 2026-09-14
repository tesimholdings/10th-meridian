import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import { icsForRequest } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const { id } = await context.params;
  const viewer = viewerProfile();
  const req = ctx.state.requests.find((r) => r.id === id);
  if (!req || (req.fromProfileId !== viewer.id && req.toProfileId !== viewer.id)) {
    return jsonError("Not found.", 404);
  }
  try {
    const ics = icsForRequest(ctx.state, id, getPreviewStore().profiles);
    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="crossing-${id}.ics"`,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not build calendar.");
  }
}
