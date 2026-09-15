import { integrationStatus } from "@/lib/env";
import { sentryPlaceholderStatus } from "@/lib/sentry/placeholders";
import { authMode } from "@/lib/supabase/auth";
import { streamMode } from "@/lib/stream/client";
import { stripeMode } from "@/lib/stripe/client";

export function GET() {
  return Response.json({
    ok: true,
    integrations: integrationStatus(),
    auth: authMode(),
    stream: streamMode(),
    stripe: stripeMode(),
    sentry: sentryPlaceholderStatus(),
    note: "Missing env is demo-safe. Nothing is charged or mailed without keys.",
  });
}
