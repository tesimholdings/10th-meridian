import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { updateViewerProfile, viewerProfile } from "@/lib/preview/store";
import { normalizeIntents } from "@/lib/onboarding/intents";
import type { ProfileRecord } from "@/lib/data/types";

const schema = z.object({
  displayName: z.string().optional(),
  headline: z.string().optional(),
  roleTitle: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  intents: z.array(z.string()).optional(),
  intentOther: z.string().optional(),
  socials: z
    .array(
      z.object({
        provider: z.enum([
          "linkedin",
          "instagram",
          "facebook",
          "x",
          "website",
          "whatsapp",
          "telegram",
          "youtube",
        ]),
        handle: z.string().optional(),
        url: z.string().optional(),
        connected: z.boolean(),
        mode: z.enum(["demo", "oauth"]),
        connectedAt: z.string().optional(),
      }),
    )
    .optional(),
  privacy: z
    .object({
      website: z.boolean(),
      linkedin: z.boolean(),
      socials: z.boolean().optional(),
      gallery: z.boolean(),
      offers: z.boolean(),
      needs: z.boolean(),
      strengths: z.boolean(),
      events: z.boolean(),
    })
    .optional(),
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
  visibility: z.enum(["members", "index_only", "hidden"]).optional(),
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
  const { intents: rawIntents, intentOther: rawOther, privacy, ...rest } = parsed.data;
  const patch: Partial<ProfileRecord> = { ...rest };
  if (privacy) {
    patch.privacy = { ...privacy, socials: privacy.socials ?? true };
  }
  if (rawIntents || rawOther) {
    const normalized = normalizeIntents(rawIntents ?? [], rawOther);
    patch.intents = normalized.intents;
    patch.intentOther = normalized.intentOther;
  }
  const profile = updateViewerProfile(patch);
  return Response.json({ ok: true, profile });
}
