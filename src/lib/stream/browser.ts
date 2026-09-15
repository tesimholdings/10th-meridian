"use client";

import type { StreamTokenResult } from "@/lib/stream/token";

/** Client helper: ask the server for a Stream token. Demo returns stub: true. */
export async function fetchStreamToken(): Promise<StreamTokenResult> {
  const res = await fetch("/api/stream/token", { method: "POST" });
  if (!res.ok) {
    return {
      ok: true,
      stub: true,
      token: null,
      apiKey: null,
      note: "Stream token request was denied or unavailable.",
    };
  }
  return (await res.json()) as StreamTokenResult;
}
