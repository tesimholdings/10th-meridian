"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { FormalLockup } from "@/components/brand/logo";
import { LockGrain } from "@/components/lock/lock-grain";
import { Button } from "@/components/ui/button";

export function RouteErrorFallback({
  error,
  reset,
  route,
  tone = "void",
  title,
  body,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  route: string;
  tone?: "void" | "house";
  title: string;
  body: string;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { route },
      extra: error.digest ? { digest: error.digest } : undefined,
    });
  }, [error, route]);

  if (tone === "house") {
    return (
      <div className="house-light min-h-dvh w-full text-[var(--navy)]">
        <div className="member-frame mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-6 py-16">
          <p className="label">A pause</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight">{title}</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--navy-soft)]">
            {body}
          </p>
          <div className="mt-8">
            <Button variant="navy" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lock-gold relative min-h-dvh overflow-hidden text-ivory">
      <LockGrain />
      <div className="safe-pad relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center text-center">
        <FormalLockup knockout className="h-auto w-[min(80vw,22rem)]" />
        <h1 className="mt-10 font-serif text-3xl leading-tight text-ivory/85">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/55">{body}</p>
        <div className="mt-8">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
