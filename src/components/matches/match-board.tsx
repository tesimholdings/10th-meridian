"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MatchIndex } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";
import type { IntroRequest } from "@/lib/data/types";

export function MatchBoard({
  index,
  intros,
  compact = false,
}: {
  index: MatchIndex;
  intros: IntroRequest[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function feedback(targetId: string, signal: "relevant" | "not_relevant" | "declined" | "hidden") {
    setPending(targetId + signal);
    await fetch("/api/matching/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, signal }),
    });
    setPending(null);
    setNote(signal === "relevant" ? "Marked relevant." : "Removed from this ranking.");
    router.refresh();
  }

  async function introduce(targetId: string) {
    setPending(targetId + "intro");
    const res = await fetch("/api/introductions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setPending(null);
    setNote(json.ok ? "Introduction requested." : "Could not request that introduction.");
    router.refresh();
  }

  const rest = compact ? [] : index.meridian100.slice(10);

  return (
    <div className="grid gap-10">
      {note ? <p className="text-sm text-gold">{note}</p> : null}
      <section>
        <p className="label">The Meridian 10</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl">{brand.meridian10}</h2>
        <ol className="mt-6 grid gap-4">
          {index.meridian10.map((row, i) => {
            const intro = intros.find((x) => x.targetId === row.target.id);
            return (
              <li key={row.target.id} className="border border-[var(--line)] p-4">
                <div className="grid grid-cols-[auto_1fr] gap-4">
                  <Link
                    href={`/member/members/${row.target.id}`}
                    className="flex h-16 w-16 items-center justify-center font-serif text-xl"
                    style={{ background: row.target.accent }}
                  >
                    {row.target.initials}
                  </Link>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link href={`/member/members/${row.target.id}`} className="font-serif text-2xl">
                        {row.target.displayName}
                      </Link>
                      <p className="text-[11px] tracking-[0.18em] uppercase text-gold">
                        {String(i + 1).padStart(2, "0")} · {Math.round(row.weighted * 100)}
                      </p>
                    </div>
                    <p className="text-sm text-ivory-muted">{row.target.headline}</p>
                    <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
                      {row.source === "human_curated" ? "Human-curated" : "Algorithmic signal"}
                      {row.target.isDemo ? " · SYNTHETIC DEMO" : ""}
                      {intro ? ` · Intro ${intro.status}` : ""}
                    </p>
                    <p className="label mt-4">Why you should meet</p>
                    <ul className="mt-2 grid gap-1 text-sm text-ivory-muted">
                      {row.explanations.map((e) => (
                        <li key={e.pillar}>
                          <span className="text-gold">{e.pillar}.</span> {e.text}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "relevant")}>
                        Relevant
                      </Action>
                      <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "not_relevant")}>
                        Not relevant
                      </Action>
                      <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "hidden")}>
                        Hide
                      </Action>
                      <Action disabled={pending !== null} onClick={() => void introduce(row.target.id)}>
                        {intro ? "Requested" : "Request introduction"}
                      </Action>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {compact ? null : (
        <section>
          <p className="label">The Meridian 100</p>
          <h2 className="mt-2 font-serif text-3xl">{brand.meridian100}</h2>
          <p className="mt-2 text-sm text-ivory-dim">
            {index.meridian100.length} eligible connections. Never invented.
          </p>
          <ol className="mt-6 grid gap-3">
            {rest.map((row, i) => (
              <li key={row.target.id} className="border-b border-[var(--line)] py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/member/members/${row.target.id}`}>
                    <p className="font-serif text-xl">{row.target.displayName}</p>
                    <p className="text-sm text-ivory-muted">{row.target.headline}</p>
                  </Link>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-gold">
                    {String(i + 11).padStart(2, "0")}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "relevant")}>
                    Relevant
                  </Action>
                  <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "hidden")}>
                    Hide
                  </Action>
                  <Action disabled={pending !== null} onClick={() => void introduce(row.target.id)}>
                    Introduce
                  </Action>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Action({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase text-ivory-muted"
    >
      {children}
    </button>
  );
}
