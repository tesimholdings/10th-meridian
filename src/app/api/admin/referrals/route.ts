import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { createReferral, getPreviewStore, revokeReferral } from "@/lib/preview/store";

const createSchema = z.object({
  action: z.literal("create"),
  code: z.string(),
  label: z.string().optional(),
  maxUses: z.number().int().min(1).max(500).optional(),
});

const revokeSchema = z.object({
  action: z.literal("revoke"),
  id: z.string(),
});

export async function GET() {
  return Response.json({ referrals: getPreviewStore().referrals });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const create = createSchema.safeParse(body);
  if (create.success) {
    return Response.json(
      createReferral({
        code: create.data.code,
        label: create.data.label ?? "",
        maxUses: create.data.maxUses ?? 5,
        actor: access.user.name,
      }),
    );
  }
  const revoke = revokeSchema.safeParse(body);
  if (revoke.success) {
    return Response.json(revokeReferral(revoke.data.id, access.user.name));
  }
  return Response.json({ ok: false }, { status: 400 });
}
