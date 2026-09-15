import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasSentryAuthToken,
  resolveSentryDsn,
  SENTRY_ORG,
  SENTRY_PROJECT,
  sentryEnabled,
  sentryEnvironment,
  tracesSampleRate,
} from "@/lib/sentry/config";

describe("sentry config", () => {
  it("pins the Tenth Meridian org and Next.js project slug", () => {
    assert.equal(SENTRY_ORG, "tenth-meridian");
    assert.equal(SENTRY_PROJECT, "javascript-nextjs");
  });

  it("prefers SENTRY_DSN and falls back to the public client DSN", () => {
    assert.equal(
      resolveSentryDsn({ SENTRY_DSN: " https://example.ingest.sentry.io/1 " }),
      "https://example.ingest.sentry.io/1",
    );
    assert.equal(
      resolveSentryDsn({ NEXT_PUBLIC_SENTRY_DSN: "https://public.example/2" }),
      "https://public.example/2",
    );
    assert.equal(resolveSentryDsn({}), "");
    assert.equal(sentryEnabled({}), false);
    assert.equal(sentryEnabled({ SENTRY_DSN: "https://example/1" }), true);
  });

  it("does not invent a live DSN or auth token", () => {
    assert.equal(resolveSentryDsn({}), "");
    assert.equal(hasSentryAuthToken({}), false);
    assert.equal(hasSentryAuthToken({ SENTRY_AUTH_TOKEN: " " }), false);
  });

  it("samples every trace in development and 10% otherwise", () => {
    assert.equal(tracesSampleRate({ NODE_ENV: "development" }), 1);
    assert.equal(tracesSampleRate({ NODE_ENV: "production" }), 0.1);
  });

  it("uses Vercel env as the Sentry environment when present", () => {
    assert.equal(
      sentryEnvironment({ VERCEL_ENV: "preview", NODE_ENV: "production" }),
      "preview",
    );
    assert.equal(sentryEnvironment({ NODE_ENV: "test" }), "test");
  });
});
