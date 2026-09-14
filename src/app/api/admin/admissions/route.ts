import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import {
  acceptedThisCohort,
  getPreviewStore,
  setApplicationStatus,
  shiftApplicationCohort,
} from "@/lib/preview/store";
import { APPLICATION_STATUSES } from "@/lib/data/types";

const schema = z.object({
  id: z.string(),
  action: z.enum(["status", "next_cohort"]),
  status: z.enum(APPLICATION_STATUSES).optional(),
  override: z.boolean().optional(),
});

export async function GET() {
  const store = getPreviewStore();
  return Response.json({
    applications: store.applications,
    cap: store.admissionsCap,
    accepted: acceptedThisCohort(),
    remaining: Math.max(0, store.admissionsCap - acceptedThisCohort()),
    cohortMonth: store.cohortMonth,
  });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  if (parsed.data.action === "next_cohort") {
    return Response.json(shiftApplicationCohort(parsed.data.id, access.user.name));
  }
  if (!parsed.data.status) return Response.json({ ok: false }, { status: 400 });
  return Response.json(
    setApplicationStatus({
      id: parsed.data.id,
      status: parsed.data.status,
      override: parsed.data.override,
      actor: access.user.name,
    }),
  );
}
