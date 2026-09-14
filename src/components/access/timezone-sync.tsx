"use client";

import { useEffect } from "react";

export function TimezoneSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tm_tz="))
      ?.split("=")[1];
    if (existing === encodeURIComponent(tz) || existing === tz) return;
    void fetch("/api/timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeZone: tz }),
    });
  }, []);
  return null;
}
