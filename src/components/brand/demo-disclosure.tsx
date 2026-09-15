"use client";

import { useEffect, useId, useState } from "react";

export function DemoDisclosure() {
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="border-b border-[var(--line)]">
      <button
        type="button"
        className="flex min-h-10 w-full items-center justify-between px-1 text-left text-xs text-[var(--ivory-dim)]"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Demo preview</span>
        <span>{open ? "Hide" : "Details"}</span>
      </button>
      {open ? (
        <p id={id} className="px-1 pb-3 text-xs leading-relaxed text-[var(--ivory-dim)]">
          Synthetic people, events, and messages. Not real members. Private data is never shown.
          Aspirational imagery — not photographs of members or completed events.
        </p>
      ) : null}
    </div>
  );
}
