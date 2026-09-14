"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function register() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const json = (await res.json()) as { message?: string };
      setMessage(
        json.message ??
          (res.ok
            ? "Listed."
            : "Registration couldn’t be saved. Please try again."),
      );
      router.refresh();
    } catch {
      setMessage("Connection interrupted. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={busy}
        onClick={() => void register()}
        className="meridian-button min-h-12 border border-[var(--gold)] px-5 text-[11px] tracking-[0.18em] uppercase text-gold"
      >
        {busy ? "Saving your place…" : "Register or join waitlist"}
      </button>
      {message ? (
        <p role="status" className="mt-3 text-sm text-ivory-muted">
          {message}
        </p>
      ) : null}
    </div>
  );
}
