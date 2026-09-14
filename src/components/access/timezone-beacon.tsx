"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "tm_tz";

function readCookie(name: string): string | null {
  const parts = document.cookie.split("; ");
  const row = parts.find((p) => p.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

export function TimezoneBeacon() {
  const router = useRouter();
  const refreshed = useRef(false);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const existing = readCookie(COOKIE);
    if (existing === tz) return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${encodeURIComponent(tz)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    if (!refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [router]);

  return null;
}
