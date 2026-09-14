import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { viewerDemoProfile } from "@/lib/data/demo";
import { ASK_INTENTS } from "@/lib/matching/ask/types";
import {
  computeAskIndex,
  demoAskIndexFor,
  invalidateAskCache,
} from "@/lib/matching/ask/service";
import {
  getPreviewStore,
  lastHelpAsk,
  recordHelpAsk,
  viewerProfile,
} from "@/lib/preview/store";

const schema = z.object({
  query: z.string().max(800).optional(),
  intents: z.array(z.enum(ASK_INTENTS)).optional(),
  filters: z
    .object({
      location: z.string().max(80).optional(),
      industry: z.string().max(80).optional(),
      availability: z.string().max(40).optional(),
      offer: z.string().max(80).optional(),
      need: z.string().max(80).optional(),
    })
    .optional(),
});

function viewerIdFor(access: Awaited<ReturnType<typeof resolveAccessContext>>) {
  return access.user?.id?.startsWith("preview-")
    ? viewerDemoProfile.id
    : (access.user?.id ?? viewerDemoProfile.id);
}

export async function GET() {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const last = lastHelpAsk(viewer.id);
  if (!last) {
    return Response.json({
      ok: true,
      emptyQuery: true,
      people: [],
      openHouseIsolation: !access.decision.isMemberAccess,
    });
  }
  const index = await demoAskIndexFor({
    viewer,
    query: last.query,
    intents: last.intents,
    filters: last.filters,
    askId: last.id,
    isMemberAccess: access.decision.isMemberAccess,
  });
  return Response.json({
    ok: true,
    ask: index.ask,
    people: index.people,
    generatedAt: index.generatedAt,
    emptyQuery: index.emptyQuery,
    openHouseIsolation: index.openHouseIsolation,
    weights: index.weights,
  });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "The ask could not be read." }, { status: 400 });
  }
  const viewer = viewerProfile();
  invalidateAskCache(viewer.id);
  const index = await computeAskIndex({
    viewer,
    members: getPreviewStore().profiles,
    query: parsed.data.query,
    intents: parsed.data.intents,
    filters: parsed.data.filters,
    askWeights: getPreviewStore().askWeights,
    indexWeights: getPreviewStore().weights,
    feedback: getPreviewStore().askFeedback,
    indexFeedback: getPreviewStore().feedback,
    curation: getPreviewStore().curation,
    blocks: getPreviewStore().crossings.blocks,
    standings: getPreviewStore().crossings.standings,
    useSemantic: true,
    isMemberAccess: access.decision.isMemberAccess,
  });
  if (!index.emptyQuery) {
    recordHelpAsk(index.ask, viewerIdFor(access));
  }
  return Response.json({
    ok: true,
    ask: index.ask,
    people: index.people,
    generatedAt: index.generatedAt,
    emptyQuery: index.emptyQuery,
    openHouseIsolation: index.openHouseIsolation,
    weights: index.weights,
    note: index.emptyQuery
      ? "Say what you need. The house does not invent people from a blank ask."
      : "Ranked from the Index. SYNTHETIC DEMO in preview.",
  });
}
