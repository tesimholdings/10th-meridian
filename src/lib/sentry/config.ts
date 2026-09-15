/**
 * Sentry destination metadata. Live DSN and auth token stay in env —
 * never commit them. Client bundles only see NEXT_PUBLIC_SENTRY_DSN.
 */

export const SENTRY_ORG = "tenth-meridian";
export const SENTRY_PROJECT = "javascript-nextjs";

type EnvMap = Record<string, string | undefined>;

export function resolveSentryDsn(env: EnvMap = process.env): string {
  return (env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN ?? "").trim();
}

export function sentryEnabled(env: EnvMap = process.env): boolean {
  return Boolean(resolveSentryDsn(env));
}

export function sentryEnvironment(env: EnvMap = process.env): string {
  return env.VERCEL_ENV || env.NODE_ENV || "development";
}

export function tracesSampleRate(env: EnvMap = process.env): number {
  return env.NODE_ENV === "development" ? 1 : 0.1;
}

export function hasSentryAuthToken(env: EnvMap = process.env): boolean {
  return Boolean((env.SENTRY_AUTH_TOKEN ?? "").trim());
}
