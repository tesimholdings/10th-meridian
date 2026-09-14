"use client";

import { useId, useState } from "react";

export function DemoDisclosure() {
  const id = useId();
  const [open, setOpen] = useState(false);
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
          Higgsfield art will replace stills later — current images are original House placeholders.
        </p>
      ) : null}
    </div>
  );
}
