import { resolveAccessContext } from "@/lib/access/context";
import { invalidateMatchCache } from "@/lib/matching/service";
import { loadHybridMatchIndex } from "@/lib/matching/postgres";
import { viewerDemoProfile } from "@/lib/data/demo";
import { getPreviewStore } from "@/lib/preview/store";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && access.user?.role !== "administrator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  invalidateMatchCache(viewerDemoProfile.id);
  const store = getPreviewStore();
  const index = await loadHybridMatchIndex({
    viewer: viewerDemoProfile,
    members: store.profiles,
    weights: store.weights,
    feedback: store.feedback,
    curation: store.curation,
    blocks: store.crossings.blocks,
    useSemantic: true,
  });
  return Response.json({
    ok: true,
    generatedAt: index.generatedAt,
    meridian10: index.meridian10.length,
    meridian100: index.meridian100.length,
    source: index.source,
    persisted: index.persisted,
  });
}
