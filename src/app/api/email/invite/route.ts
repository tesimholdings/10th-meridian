import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { sendInvite } from "@/lib/resend/send";

const schema = z.object({
  email: z.string().email(),
  inviteId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    return Response.json({ ok: false, message: "Stewards only." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "A valid email is required." }, { status: 400 });
  }
  const result = await sendInvite(
    parsed.data.email,
    parsed.data.inviteId ?? parsed.data.email,
  );
  return Response.json({
    ok: result.ok,
    stub: result.stub,
    message: result.stub
      ? "Invite recorded in stub mode. Set RESEND_API_KEY to send from team@tenmeridian.com."
      : "Invitation queued.",
  });
}
