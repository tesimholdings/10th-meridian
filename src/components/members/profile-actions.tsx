"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileActions({
  targetId,
  introStatus,
  inCircle,
  removedFromIndex,
  compact = false,
}: {
  targetId: string;
  introStatus?: string;
  inCircle?: boolean;
  removedFromIndex?: boolean;
  compact?: boolean;
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
    setNote("That conversation is unavailable. Retry.");
  }

  async function safety(action: "report" | "mute") {
    setPending(true);
    const res = await fetch("/api/safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setPending(false);
    setNote(json.message ?? (json.ok ? "Noted." : "Could not complete that."));
    router.refresh();
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
            : "Removed from For you recommendations."
        : "Could not update the network.",
    );
    router.refresh();
  }

  return (
    <div className={compact ? "" : "mt-5"}>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => void message()} className="action-quiet">
          Message
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void circle(inCircle ? "remove" : "add")}
          className="action-quiet"
        >
          {inCircle ? "In Circle" : "Circle"}
        </button>
        <details>
          <summary className="action-quiet cursor-pointer list-none">More</summary>
          <div className="mt-2 grid gap-1">
            <button type="button" disabled={pending} onClick={() => void introduce()} className="min-h-10 text-left text-sm">
              {introStatus ? `Intro ${introStatus}` : "Request introduction"}
            </button>
            {removedFromIndex ? null : (
              <button type="button" disabled={pending} onClick={() => void circle("remove-index")} className="min-h-10 text-left text-sm">
                Remove from For you
              </button>
            )}
            <button type="button" disabled={pending} onClick={() => void safety("mute")} className="min-h-10 text-left text-sm">
              Mute
            </button>
            <button type="button" disabled={pending} onClick={() => void safety("report")} className="min-h-10 text-left text-sm">
              Report
            </button>
            <a href="/member/help" className="flex min-h-10 items-center text-sm">
              Help
            </a>
          </div>
        </details>
      </div>
      {note ? <p className="mt-2 text-sm text-[var(--gold)]">{note}</p> : null}
    </div>
  );
}
