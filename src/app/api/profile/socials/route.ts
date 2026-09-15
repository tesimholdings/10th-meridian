import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { socialOAuthAvailability } from "@/lib/env";
import {
  connectViewerSocial,
  disconnectViewerSocial,
  viewerProfile,
} from "@/lib/preview/store";
import {
  DEMO_SOCIAL_DISCLOSURE,
  SOCIAL_PROVIDERS,
  connectModeFor,
  normalizeSocialInput,
} from "@/lib/onboarding/socials";

const schema = z.object({
  action: z.enum(["connect", "disconnect"]),
  provider: z.enum(SOCIAL_PROVIDERS),
  handle: z.string().optional(),
  url: z.string().optional(),
  mode: z.enum(["demo", "oauth"]).optional(),
});

export async function GET() {
  const oauth = socialOAuthAvailability();
  const profile = viewerProfile();
  return Response.json({
    connections: profile.socials ?? [],
    oauth,
    disclosure: DEMO_SOCIAL_DISCLOSURE,
  });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "Invalid social connect." }, { status: 400 });
  }
  if (parsed.data.action === "disconnect") {
    const profile = disconnectViewerSocial(parsed.data.provider);
    return Response.json({ ok: true, profile, oauth: socialOAuthAvailability() });
  }
  const raw = parsed.data.handle || parsed.data.url || "";
  const normalized = normalizeSocialInput(parsed.data.provider, raw);
  if (!normalized.ok) {
    return Response.json({ ok: false, message: normalized.message }, { status: 400 });
  }
  const oauth = socialOAuthAvailability();
  const mode = parsed.data.mode === "oauth" && connectModeFor(parsed.data.provider, oauth) === "oauth"
    ? "oauth"
    : "demo";
  const profile = connectViewerSocial({
    provider: parsed.data.provider,
    handle: normalized.handle,
    url: normalized.url,
    connected: true,
    mode,
    connectedAt: new Date().toISOString(),
  });
  return Response.json({
    ok: true,
    profile,
    oauth,
    disclosure: mode === "oauth" ? undefined : DEMO_SOCIAL_DISCLOSURE,
  });
}
