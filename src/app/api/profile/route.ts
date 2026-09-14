import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { updateViewerProfile, viewerProfile } from "@/lib/preview/store";

const schema = z.object({
  displayName: z.string().optional(),
  headline: z.string().optional(),
  roleTitle: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  industries: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  ambitions: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  offers: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  geography: z.array(z.string()).optional(),
  travel: z.array(z.string()).optional(),
  causes: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  communicationStyle: z.string().optional(),
  availability: z.enum(["open", "selective", "limited", "paused"]).optional(),
  visibility: z.enum(["members", "matches_only", "hidden"]).optional(),
});

export async function GET() {
  return Response.json({ profile: viewerProfile() });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "Invalid profile." }, { status: 400 });
  }
  const profile = updateViewerProfile(parsed.data);
  return Response.json({ ok: true, profile });
}
