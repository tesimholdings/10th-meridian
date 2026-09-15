/**
 * Public PostHog config. Safe to import from client or server.
 * No SDK init happens here — missing key is a complete no-op.
 */

export type PosthogPublicConfig = {
  enabled: boolean;
  key: string | null;
  host: string;
};

export function posthogPublicConfig(): PosthogPublicConfig {
  const key = (process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "").trim();
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").trim();
  return {
    enabled: Boolean(key),
    key: key || null,
    host: host || "https://us.i.posthog.com",
  };
}
