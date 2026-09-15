import { env, socialOAuthAvailability } from "@/lib/env";
import { DEMO_SOCIAL_DISCLOSURE, isSocialProvider } from "@/lib/onboarding/socials";

const AUTHORIZE: Record<"linkedin" | "instagram" | "facebook" | "x", (clientId: string, redirect: string) => string> = {
  linkedin: (clientId, redirect) =>
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=openid%20profile`,
  instagram: (clientId, redirect) =>
    `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=user_profile&response_type=code`,
  facebook: (clientId, redirect) =>
    `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=public_profile`,
  x: (clientId, redirect) =>
    `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=users.read&code_challenge=challenge&code_challenge_method=plain`,
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isSocialProvider(provider) || provider === "website" || provider === "whatsapp" || provider === "telegram" || provider === "youtube") {
    return Response.json(
      { ok: false, mode: "demo", message: "That room uses a pasted handle, not OAuth." },
      { status: 400 },
    );
  }
  const oauth = socialOAuthAvailability();
  if (!oauth[provider]) {
    return Response.json({
      ok: false,
      mode: "demo",
      message: `${DEMO_SOCIAL_DISCLOSURE} ${provider} OAuth env vars are not set.`,
    });
  }
  const clientId =
    provider === "linkedin"
      ? env.linkedinClientId
      : provider === "instagram"
        ? env.instagramClientId
        : provider === "facebook"
          ? env.facebookClientId
          : env.xClientId;
  const redirect = `${env.siteUrl}/api/auth/callback`;
  return Response.json({
    ok: true,
    mode: "oauth",
    authorizeUrl: AUTHORIZE[provider](clientId, redirect),
  });
}
