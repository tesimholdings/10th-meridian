"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileActions({
  targetId,
  introStatus,
}: {
  targetId: string;
  introStatus?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function introduce() {
    if (busy || introStatus) return;
    setBusy(true);
    try {
      const res = await fetch("/api/introductions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const json = (await res.json()) as { ok?: boolean };
      setNote(
        res.ok && json.ok
          ? "Introduction requested."
          : "Could not request that introduction.",
      );
      router.refresh();
    } catch {
      setNote("The introduction couldn’t be requested. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <Link
        href="/member/channels"
        className="meridian-button inline-flex min-h-12 items-center border border-[var(--line)] px-4 text-[11px] tracking-[0.18em] uppercase"
      >
        Browse channels
      </Link>
      <button
        type="button"
        disabled={busy || Boolean(introStatus)}
        onClick={() => void introduce()}
        className="meridian-button inline-flex min-h-12 items-center bg-[var(--gold)] px-4 text-[11px] tracking-[0.18em] uppercase text-[var(--void)]"
      >
        {busy
          ? "Requesting…"
          : introStatus
            ? `Intro ${introStatus}`
            : "Request introduction"}
      </button>
      {note ? (
        <p role="status" className="w-full text-sm text-gold">
          {note}
        </p>
      ) : null}
    </div>
  );
}
