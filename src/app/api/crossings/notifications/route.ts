import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import { refreshNotifications } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { z } from "zod";

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  const viewer = viewerProfile();
  const notifications = refreshNotifications(ctx.state, viewer, getPreviewStore().profiles);
  const prefs = ctx.state.prefs.find((p) => p.profileId === viewer.id) ?? {
    profileId: viewer.id,
    overlapDigest: true,
    goalRelevance: true,
    tableSuggestions: true,
    requestUpdates: true,
    digest: "weekly" as const,
  };
  return Response.json({ ok: true, notifications, prefs, demo: true });
}

const prefsSchema = z.object({
  overlapDigest: z.boolean(),
  goalRelevance: z.boolean(),
  tableSuggestions: z.boolean(),
  requestUpdates: z.boolean(),
  digest: z.enum(["off", "daily", "weekly"]),
});

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const parsed = prefsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid preferences.");
  const viewer = viewerProfile();
  const existing = ctx.state.prefs.find((p) => p.profileId === viewer.id);
  if (existing) Object.assign(existing, parsed.data);
  else ctx.state.prefs.push({ profileId: viewer.id, ...parsed.data });
  return Response.json({ ok: true, prefs: { profileId: viewer.id, ...parsed.data } });
}
