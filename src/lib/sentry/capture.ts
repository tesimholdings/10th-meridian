import * as Sentry from "@sentry/nextjs";

export function captureRouteError(
  error: unknown,
  context: { route: string; extra?: Record<string, unknown> },
) {
  Sentry.withScope((scope) => {
    scope.setTag("route", context.route);
    if (context.extra) {
      scope.setContext("route", context.extra);
    }
    Sentry.captureException(error);
  });
}

/** Drop applicant / member PII that Sentry should never persist. */
export function scrubSentryEvent<T extends { user?: { id?: string } | null; request?: { data?: unknown; cookies?: unknown } }>(
  event: T,
): T {
  if (event.user) {
    event.user = event.user.id ? { id: event.user.id } : null;
  }
  if (event.request) {
    event.request.data = undefined;
    event.request.cookies = undefined;
  }
  return event;
}
