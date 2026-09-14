import { z } from "zod";
import { crossingsAccess, jsonError } from "@/lib/crossings/http";
import { upsertCityHost } from "@/lib/crossings/service";
import { MEETING_FORMATS } from "@/lib/crossings/types";
import { viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  city: z.string().min(2),
  country: z.string().min(2),
  timezone: z.string().min(3),
  recurring: z.boolean(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  meetingTypes: z.array(z.enum(MEETING_FORMATS)).min(1),
  expertise: z.array(z.string()).max(8),
  welcomeDirectRequests: z.boolean(),
  maxRequestsPerWeek: z.number().int().min(1).max(14),
});

export async function GET() {
  const ctx = await crossingsAccess();
  if (!ctx.allowed) return jsonError("The house is closed.", 403);
  return Response.json({ ok: true, hosts: ctx.state.hosts, demo: true });
}

export async function POST(request: Request) {
  const ctx = await crossingsAccess();
  if (!ctx.canMutate) return jsonError("Active members only.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("City Hosts need a city and meeting types.");
  const viewer = viewerProfile();
  const host = upsertCityHost(ctx.state, { ...parsed.data, profileId: viewer.id });
  return Response.json({ ok: true, host });
}
