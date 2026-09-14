"use client";

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
  const [note, setNote] = useState<string | null>(null);

  async function introduce() {
    const res = await fetch("/api/introductions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setNote(json.ok ? "Introduction requested." : "Could not request that introduction.");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <a
        href="/member/channels"
        className="inline-flex min-h-12 items-center border border-[var(--line)] px-4 text-[11px] tracking-[0.18em] uppercase"
      >
        Message
      </a>
      <button
        type="button"
        onClick={() => void introduce()}
        className="inline-flex min-h-12 items-center bg-[var(--gold)] px-4 text-[11px] tracking-[0.18em] uppercase text-[var(--void)]"
      >
        {introStatus ? `Intro ${introStatus}` : "Request introduction"}
      </button>
      {note ? <p className="w-full text-sm text-gold">{note}</p> : null}
    </div>
  );
}
