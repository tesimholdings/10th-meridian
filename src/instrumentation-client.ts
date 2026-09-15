import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry/capture";
import {
  resolveSentryDsn,
  sentryEnvironment,
  tracesSampleRate,
} from "@/lib/sentry/config";

const dsn = resolveSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    environment: sentryEnvironment(),
    tracesSampleRate: tracesSampleRate(),
    sendDefaultPii: false,
    enableLogs: true,
    // Private network: record only sessions that hit an error.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.replayIntegration()],
    beforeSend(event) {
      return scrubSentryEvent(event);
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
