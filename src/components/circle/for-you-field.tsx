"use client";

import { useMemo, useState, type CSSProperties } from "react";
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
  const count = Math.min(size, max, shown.length);
  const span = Math.max(1, max - 10);
  const fill = ((Math.min(size, max) - 10) / span) * 100;

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--ivory-dim)]">No one in this frame. Profiles are never invented.</p>;
  }

  return (
    <div>
      <div className="meridian-dial surface rounded-3xl px-5 py-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="meridian-dial-value">{count}</p>
            <p className="label mt-2">{size <= 10 ? MERIDIAN_10 : `${count} people`}</p>
          </div>
          <p className="meridian-dial-of">of {shown.length}</p>
        </div>
        <p className="mt-3 max-w-xl text-sm text-[var(--navy-soft)]">{brand.meridianSize}</p>
        <label className="mt-5 grid gap-3">
          <span className="sr-only">
            Circle size, {count} of {shown.length}. {MERIDIAN_10} to {MERIDIAN_100}
          </span>
          <input
            className="meridian-range"
            type="range"
            min={10}
            max={max}
            step={1}
            value={Math.min(size, max)}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-valuemin={10}
            aria-valuemax={max}
            aria-valuenow={Math.min(size, max)}
            aria-valuetext={`${count} of ${shown.length}`}
            style={{ "--range-fill": `${fill}%` } as CSSProperties}
          />
          <span className="meridian-dial-ends">
            <span>10 — immediate</span>
            <span>100 — wider field</span>
          </span>
        </label>
      </div>

      <ul className="mt-4 grid gap-1">
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
