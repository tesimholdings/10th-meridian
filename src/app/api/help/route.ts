import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { recordStewardNote } from "@/lib/preview/store";

const schema = z.object({
  message: z.string().trim().min(8).max(2000),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.user || (!access.decision.allowed && !access.decision.isMemberAccess)) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  recordStewardNote({
    actor: access.user.name || access.user.email,
    message: parsed.data.message,
  });
  return Response.json({ ok: true });
}
