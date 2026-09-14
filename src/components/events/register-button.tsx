"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function register() {
    const res = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    const json = (await res.json()) as { message?: string };
    setMessage(json.message ?? "Listed.");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => void register()}
        className="min-h-12 border border-[var(--gold)] px-5 text-[11px] tracking-[0.18em] uppercase text-gold"
      >
        Register or join waitlist
      </button>
      {message ? <p className="mt-3 text-sm text-ivory-muted">{message}</p> : null}
    </div>
  );
}
