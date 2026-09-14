import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { normalizeAskWeights } from "@/lib/matching/ask/score";
import { invalidateAskCache } from "@/lib/matching/ask/service";
import { getPreviewStore, setAskWeights } from "@/lib/preview/store";

const schema = z.object({
  complementary: z.number().nonnegative(),
  meridian: z.number().nonnegative(),
  industry: z.number().nonnegative(),
  geography: z.number().nonnegative(),
  availability: z.number().nonnegative(),
  semantic: z.number().nonnegative(),
});

export async function GET() {
  return Response.json({ weights: getPreviewStore().askWeights });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "Invalid weights." }, { status: 400 });
  }
  const weights = setAskWeights(normalizeAskWeights(parsed.data), access.user.name);
  invalidateAskCache();
  return Response.json({ ok: true, weights });
}
