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
    includeLocalVariables: false,
    enableLogs: true,
    beforeSend(event) {
      return scrubSentryEvent(event);
    },
    tracesSampler: ({ name, inheritOrSampleWith }) => {
      if (name.includes("/api/health") || name.includes("/monitoring")) {
        return 0;
      }
      return inheritOrSampleWith(tracesSampleRate());
    },
  });
}
