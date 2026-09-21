import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { canPromoteAttendance } from "@/lib/events/attendance";
import { getPreviewStore, promoteFromWaitlist, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  eventId: z.string().min(1),
  accountId: z.string().min(1),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false, message: "The house is closed." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, message: "Missing guest." }, { status: 400 });

  const viewer = viewerProfile();
  const event = getPreviewStore().events.find((row) => row.id === parsed.data.eventId);
  if (
    !canPromoteAttendance({
      role: access.user?.role,
      viewerId: viewer.id,
      hostProfileId: event?.hostProfileId,
    })
  ) {
    return Response.json({ ok: false, message: "Only the host or a steward can promote." }, { status: 403 });
  }

  const result = promoteFromWaitlist(parsed.data.eventId, parsed.data.accountId, viewer.id);
  if (!result.ok) return Response.json(result, { status: 404 });
  return Response.json(result);
}
