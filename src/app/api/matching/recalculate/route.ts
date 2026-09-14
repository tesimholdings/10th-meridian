import { resolveAccessContext } from "@/lib/access/context";
import { demoIndexFor, invalidateMatchCache } from "@/lib/matching/service";
import { viewerDemoProfile } from "@/lib/data/demo";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && access.user?.role !== "administrator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  invalidateMatchCache(viewerDemoProfile.id);
  const index = await demoIndexFor(viewerDemoProfile);
  return Response.json({
    ok: true,
    generatedAt: index.generatedAt,
    meridian10: index.meridian10.length,
    meridian100: index.meridian100.length,
  });
}
