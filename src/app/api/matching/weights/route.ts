import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { getPreviewStore, setWeights } from "@/lib/preview/store";
import { normalizeWeights } from "@/lib/matching/score";

const schema = z.object({
  complementary: z.number().nonnegative(),
  goals: z.number().nonnegative(),
  interests: z.number().nonnegative(),
  industry: z.number().nonnegative(),
  geography: z.number().nonnegative(),
  preferences: z.number().nonnegative(),
  novelty: z.number().nonnegative(),
});

export async function GET() {
  return Response.json({ weights: getPreviewStore().weights });
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
  const weights = setWeights(normalizeWeights(parsed.data), access.user.name);
  return Response.json({ ok: true, weights });
}
