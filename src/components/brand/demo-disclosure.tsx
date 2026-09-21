"use client";

import { useEffect, useId, useState } from "react";

export function DemoDisclosure({ mode = "demo" }: { mode?: "demo" | "sample" }) {
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
        <span>{mode === "sample" ? "Sample network" : "Demo preview"}</span>
        <span>{open ? "Hide" : "Details"}</span>
      </button>
      {open ? (
        <p id={id} className="px-1 pb-3 text-xs leading-relaxed text-[var(--ivory-dim)]">
          {mode === "sample"
            ? "Names and trips on these screens are samples. They are not real members, and they are not your private record."
            : "Synthetic people, events, and messages. Not real members. Private data is never shown. Imagery is a placeholder, not a photograph of members or a completed event."}
        </p>
      ) : null}
    </div>
  );
}
