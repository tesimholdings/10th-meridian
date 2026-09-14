import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { getPreviewStore, setOpenHouse } from "@/lib/preview/store";

const schema = z.object({
  timeZone: z.string().min(3),
  day: z.number().int().min(1).max(28),
  referralHour: z.number().int().min(0).max(23),
  generalHour: z.number().int().min(0).max(23),
  closeHour: z.number().int().min(0).max(23),
  force: z.enum(["auto", "open", "closed"]).optional(),
});

export async function GET() {
  return Response.json(getPreviewStore().openHouse);
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator") {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "Invalid schedule." }, { status: 400 });
  }
  const config = setOpenHouse(parsed.data, access.user.name);
  return Response.json({ ok: true, config });
}
