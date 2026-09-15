import { crossingsAccess, jsonCaught, jsonError } from "@/lib/crossings/http";
import { blockMember } from "@/lib/crossings/service";
import { viewerProfile } from "@/lib/preview/store";

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const body = (await request.json().catch(() => null)) as { profileId?: string; reason?: string } | null;
  if (!body?.profileId) return jsonError("Missing member.");
  const viewer = viewerProfile();
  try {
    blockMember(ctx.state, viewer.id, body.profileId);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonCaught(error, "Could not block.");
  }
}
