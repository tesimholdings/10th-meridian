"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JourneyRecord } from "@/lib/crossings/types";

export function JourneyControls({ journey }: { journey: JourneyRecord }) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function act(action: "pause" | "resume" | "delete") {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/crossings/journeys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: journey.id, action }),
      });
      if (!res.ok) throw new Error("journey");
      router.push("/member/crossings");
      router.refresh();
    } catch {
      setNote("Your journey couldn’t be updated. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {journey.status === "paused" ? (
        <button
          type="button"
          disabled={busy}
          className="choice-chip min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
          onClick={() => void act("resume")}
        >
          Resume
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          className="choice-chip min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
          onClick={() => void act("pause")}
        >
          Pause
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        className="choice-chip min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
        onClick={() => {
          if (confirmDelete) void act("delete");
          else setConfirmDelete(true);
        }}
      >
        {confirmDelete ? "Confirm delete" : "Delete journey"}
      </button>
      {confirmDelete ? (
        <button
          type="button"
          className="quiet-link"
          onClick={() => setConfirmDelete(false)}
        >
          Keep journey
        </button>
      ) : null}
      {note ? (
        <p role="status" className="w-full text-sm text-gold">
          {note}
        </p>
      ) : null}
    </div>
  );
}
