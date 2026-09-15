"use client";

import { useMemo, useState } from "react";
import { IndexCard } from "@/components/matches/match-board";
import { MERIDIAN_10, MERIDIAN_100 } from "@/lib/copy/ui";
import { brand } from "@/lib/config/site";
import type { IntroRequest } from "@/lib/data/types";
import type { ScoredMatch } from "@/lib/matching/types";
import { shortMatchReason } from "@/lib/matching/reason";

export function ForYouField({
  rows,
  intros,
  circleIds,
}: {
  rows: ScoredMatch[];
  intros: IntroRequest[];
  circleIds: string[];
}) {
  const [size, setSize] = useState(10);
  const max = Math.min(100, Math.max(10, rows.length));
  const shown = useMemo(() => rows.slice(0, 100), [rows]);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--ivory-dim)]">No one in this frame. Profiles are never invented.</p>;
  }

  return (
    <div>
      <div className="surface rounded-3xl px-4 py-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="label">{size <= 10 ? MERIDIAN_10 : `${size} people`}</p>
            <p className="mt-1 text-sm text-[var(--navy-soft)]">{brand.meridianSize}</p>
          </div>
          <p className="text-sm text-[var(--ivory-dim)]">
            {Math.min(size, shown.length)} of {shown.length}
          </p>
        </div>
        <label className="mt-4 grid gap-2">
          <span className="sr-only">Circle size, {MERIDIAN_10} to {MERIDIAN_100}</span>
          <input
            type="range"
            min={10}
            max={max}
            step={1}
            value={Math.min(size, max)}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <span className="flex justify-between text-xs text-[var(--ivory-dim)]">
            <span>10 — immediate</span>
            <span>100 — wider field</span>
          </span>
        </label>
      </div>

      <ul className="mt-4 grid gap-3">
        {shown.map((row, i) => (
          <IndexCard
            key={row.target.id}
            className={`circle-person ${i < size ? "" : "is-out"}`}
            profile={row.target}
            reason={shortMatchReason(row.target, row.explanations)}
            intro={intros.find((x) => x.targetId === row.target.id)}
            inCircle={circleIds.includes(row.target.id)}
          />
        ))}
      </ul>
    </div>
  );
}
