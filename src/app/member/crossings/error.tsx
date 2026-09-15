"use client";

import { RouteErrorFallback } from "@/components/sentry/route-error";

export default function CrossingsError({
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
      tone="house"
      route="crossings"
      title="The crossing paused."
      body="City-level presence is still private. Try again — nothing here is real-time location."
    />
  );
}
