import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent } from "@sentry/core";

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
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.user) {
    const id = event.user.id;
    event.user = id === undefined ? undefined : { id: String(id) };
  }
  if (event.request) {
    event.request.data = undefined;
    event.request.cookies = undefined;
  }
  return event;
}
