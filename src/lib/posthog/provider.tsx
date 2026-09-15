"use client";

import { useEffect } from "react";
import { posthogPublicConfig } from "@/lib/posthog/config";

/**
 * Initializes posthog-js only when NEXT_PUBLIC_POSTHOG_KEY is present.
 * Without a key this component is a no-op — no network, no cookies.
 */
export function PostHogInit() {
  useEffect(() => {
    const { enabled, key, host } = posthogPublicConfig();
    if (!enabled || !key) return;

    let cancelled = false;
    void import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;
      if (posthog.__loaded) return;
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        persistence: "localStorage+cookie",
        loaded: (client) => {
          if (process.env.NODE_ENV === "development") {
            client.debug(false);
          }
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
