/**
 * Sentry DSN placeholders only.
 *
 * Full @sentry/nextjs wiring lives on PR #12 (`cursor/sentry-nextjs-1166`).
 * That PR has not landed. Do not duplicate the SDK here — rebase/merge its
 * tip when it lands. Until then these helpers only report whether a DSN
 * was pasted into env.
 */

export const SENTRY_ENV = {
  dsn: "SENTRY_DSN",
  publicDsn: "NEXT_PUBLIC_SENTRY_DSN",
  org: "SENTRY_ORG",
  project: "SENTRY_PROJECT",
  authToken: "SENTRY_AUTH_TOKEN",
} as const;

export function sentryPlaceholderStatus() {
  const dsn = (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "").trim();
  return {
    wired: false,
    dsnPresent: Boolean(dsn),
    note: "PR #12 owns the SDK. This branch only documents DSN placeholders.",
  };
}
