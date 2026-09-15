"use client";

import { RouteErrorFallback } from "@/components/sentry/route-error";

export default function MemberError({
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
      route="member"
      title="The house paused."
      body="The member rooms could not finish loading. Your place is still here. Try again."
    />
  );
}
