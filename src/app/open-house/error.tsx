"use client";

import { RouteErrorFallback } from "@/components/sentry/route-error";

export default function OpenHouseError({
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
      route="open-house"
      title="The doors hesitated."
      body="Open House could not finish loading. The house is still standing. Try again."
    />
  );
}
