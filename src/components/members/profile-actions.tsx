"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SOLICITING_COMPOSE_HINT } from "@/lib/copy/community";

export function ProfileActions({
  targetId,
  introStatus,
  inCircle,
  removedFromIndex,
}: {
  targetId: string;
  introStatus?: string;
  inCircle?: boolean;
  removedFromIndex?: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function introduce() {
    setPending(true);
    const res = await fetch("/api/introductions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setNote(json.ok ? "Introduction requested." : "Could not request that introduction.");
    setPending(false);
    router.refresh();
  }

  async function message() {
    setPending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean; href?: string };
    setPending(false);
    if (json.ok && json.href) {
      router.push(json.href);
      return;
    }
    setNote("Could not open that conversation.");
  }

  async function circle(action: "add" | "remove" | "remove-index") {
    setPending(true);
    const res = await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setPending(false);
    setNote(
      json.ok
        ? action === "add"
          ? "Added to Your Circle."
          : action === "remove"
            ? "Removed from Your Circle."
            : "Removed from Index recommendations."
        : "Could not update the network.",
    );
    router.refresh();
  }

  return (
    <div className="gold-chrome mt-6 grid gap-3 p-4 md:p-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => void message()} className="action-quiet">
          Message
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void introduce()}
          className="inline-flex min-h-12 items-center bg-[var(--gold)] px-4 text-[11px] tracking-[0.18em] uppercase text-[var(--void)]"
        >
          {introStatus ? `Intro ${introStatus}` : "Request introduction"}
        </button>
        {inCircle ? (
          <button type="button" disabled={pending} onClick={() => void circle("remove")} className="action-quiet">
            Remove from Circle
          </button>
        ) : (
          <button type="button" disabled={pending} onClick={() => void circle("add")} className="action-quiet">
            Add to Circle
          </button>
        )}
        {removedFromIndex ? null : (
          <button type="button" disabled={pending} onClick={() => void circle("remove-index")} className="action-quiet">
            Remove from Index
          </button>
        )}
      </div>
      <p className="text-[12px] leading-relaxed text-ivory-dim">{SOLICITING_COMPOSE_HINT}</p>
      {note ? <p className="text-sm text-gold">{note}</p> : null}
    </div>
  );
}
