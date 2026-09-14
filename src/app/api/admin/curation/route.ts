import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { getPreviewStore, setCuration } from "@/lib/preview/store";

const schema = z.object({
  viewerId: z.string(),
  targetId: z.string(),
  action: z.enum(["promote", "suppress"]),
  reason: z.string().min(8),
});

export async function GET() {
  return Response.json({ curation: getPreviewStore().curation });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "A written reason is required." }, { status: 400 });
  }
  const row = setCuration(parsed.data, access.user.name);
  return Response.json({ ok: true, curation: row });
}
