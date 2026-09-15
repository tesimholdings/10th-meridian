"use client";

import { RouteErrorFallback } from "@/components/sentry/route-error";

export default function ApplyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      error={error}
      reset={reset}
      route="apply"
      title="The application paused."
      body="Your words were not lost on purpose. Try again — nothing here is a promise of a place."
    />
  );
}
