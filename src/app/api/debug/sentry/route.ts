import { env } from "@/lib/env";
import { resolveSentryDsn } from "@/lib/sentry/config";

/**
 * Preview-only verification path. Throws through the real Next.js
 * request instrumentation so Sentry can confirm the server init.
 * Never enabled when Vercel production preview tools are forced off.
 */
export async function POST(request: Request) {
  if (!env.previewTools) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { marker?: string } | null;
  const marker =
    typeof body?.marker === "string" && body.marker.trim()
      ? body.marker.trim()
      : `sentry-verify-${Date.now()}`;

  throw new Error(`Sentry verification ${marker}`);
}

export async function GET() {
  if (!env.previewTools) {
    return Response.json({ ok: false }, { status: 404 });
  }
  return Response.json({
    ok: true,
    dsnConfigured: Boolean(resolveSentryDsn()),
    previewTools: true,
  });
}
