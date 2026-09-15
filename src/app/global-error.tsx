"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { route: "global" },
      extra: error.digest ? { digest: error.digest } : undefined,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-[#070809] text-[#efe6d4]">
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 1.5rem",
            textAlign: "center",
            background:
              "radial-gradient(1200px 700px at 50% 20%, rgba(196,162,100,0.12), transparent 55%), #070809",
          }}
        >
          <p
            style={{
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              color: "rgba(239,230,212,0.5)",
            }}
          >
            10th Meridian
          </p>
          <h1
            style={{
              marginTop: "1.5rem",
              fontFamily: "Georgia, serif",
              fontSize: "2rem",
              fontWeight: 500,
              maxWidth: "22rem",
            }}
          >
            The house paused.
          </h1>
          <p
            style={{
              marginTop: "1rem",
              maxWidth: "22rem",
              color: "rgba(239,230,212,0.55)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            Something unexpected happened. The field is still here. Try again
            in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              minHeight: "3rem",
              padding: "0 1.5rem",
              borderRadius: 999,
              border: "1px solid #c4a264",
              background: "#c4a264",
              color: "#092b45",
              fontSize: "0.9rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
