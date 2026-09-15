"use client";

import { RouteErrorFallback } from "@/components/sentry/route-error";

export default function AppError({
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
      route="app"
      title="The house paused."
      body="Something unexpected happened. The field is still here. Try again in a moment."
    />
  );
}
