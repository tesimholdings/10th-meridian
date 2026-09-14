"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MatchIndex } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";
import type { IntroRequest, ProfileRecord } from "@/lib/data/types";
import { WhyMeet } from "@/components/ui/why-meet";
import { DemoMark } from "@/components/brand/demo-mark";
import { EmptyState } from "@/components/crossings/states";
import { MERIDIAN_10, MERIDIAN_100, SOURCE_ALGORITHMIC, SOURCE_HUMAN } from "@/lib/copy/ui";

export function MatchBoard({
  index,
  intros,
  compact = false,
  circleIds = [],
}: {
  index: MatchIndex;
  intros: IntroRequest[];
  compact?: boolean;
  circleIds?: string[];
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

  async function message(targetId: string) {
    setPending(targetId + "dm");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean; href?: string };
    setPending(null);
    if (json.ok && json.href) {
      router.push(json.href);
      return;
    }
    setNote("Could not open that conversation.");
  }

  async function circle(targetId: string, action: "add" | "remove" | "remove-index") {
    setPending(targetId + action);
    await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    setPending(null);
    setNote(
      action === "add"
        ? "Added to Your Circle."
        : action === "remove"
          ? "Removed from Your Circle."
          : "Removed from Index recommendations.",
    );
    router.refresh();
  }

  function sourceLabel(row: { source: string; target: ProfileRecord }) {
    if (circleIds.includes(row.target.id)) return "Your Circle";
    return row.source === "human_curated" ? SOURCE_HUMAN : SOURCE_ALGORITHMIC;
  }

  const rest = compact ? [] : index.meridian100.slice(10);

  return (
    <div className="grid gap-10">
      {note ? <p className="text-sm text-gold">{note}</p> : null}
      <section>
        <p className="label">{MERIDIAN_10}</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl">{brand.meridian10}</h2>
        {index.meridian10.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="The Index is still."
              body="No eligible connections in this preview ranking. Profiles are never invented."
            />
          </div>
        ) : (
        <ol className="mt-6 grid gap-4">
          {index.meridian10.map((row, i) => {
            const intro = intros.find((x) => x.targetId === row.target.id);
            return (
              <li key={row.target.id} className="gold-chrome oh-card light-sweep p-4 md:p-5">
                <div className="grid grid-cols-[auto_1fr] gap-4">
                  <Link
                    href={`/member/members/${row.target.id}`}
                    className="flex h-16 w-16 items-center justify-center font-serif text-xl"
                    style={{ background: row.target.accent }}
                  >
                    {row.target.initials}
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link href={`/member/members/${row.target.id}`} className="font-serif text-2xl">
                        {row.target.displayName}
                      </Link>
                      <p className="text-[11px] tracking-[0.18em] uppercase text-gold">
                        {String(i + 1).padStart(2, "0")} · {Math.round(row.weighted * 100)}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-ivory-muted">{row.target.headline}</p>
                    <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
                      {sourceLabel(row)}
                      {intro ? ` · Intro ${intro.status}` : ""}
                    </p>
                    {row.target.isDemo ? (
                      <p className="mt-2">
                        <DemoMark />
                      </p>
                    ) : null}
                    <WhyMeet items={row.explanations} />
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
                      <Action disabled={pending !== null} onClick={() => void message(row.target.id)}>
                        Message
                      </Action>
                      <Action disabled={pending !== null} onClick={() => void introduce(row.target.id)}>
                        {intro ? "Requested" : "Request introduction"}
                      </Action>
                      <Action
                        disabled={pending !== null}
                        onClick={() => void circle(row.target.id, circleIds.includes(row.target.id) ? "remove" : "add")}
                      >
                        {circleIds.includes(row.target.id) ? "Remove from Circle" : "Add to Circle"}
                      </Action>
                      <Action disabled={pending !== null} onClick={() => void circle(row.target.id, "remove-index")}>
                        Remove from Index
                      </Action>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        )}
      </section>

      {compact ? null : (
        <section>
          <p className="label">{MERIDIAN_100}</p>
          <h2 className="mt-2 font-serif text-3xl">{brand.meridian100}</h2>
          <p className="mt-2 text-sm text-ivory-dim">
            {index.meridian100.length} eligible connections. Never invented.
          </p>
          {rest.length === 0 ? (
            <p className="mt-6 text-sm text-ivory-dim">The wider field is quiet in this preview.</p>
          ) : (
          <ol className="mt-6 grid gap-0">
            {rest.map((row, i) => (
              <li key={row.target.id} className="border-b border-[var(--line)] py-4">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/member/members/${row.target.id}`} className="min-w-0">
                    <p className="font-serif text-xl">{row.target.displayName}</p>
                    <p className="text-sm text-ivory-muted">{row.target.headline}</p>
                  </Link>
                  <p className="shrink-0 text-[11px] tracking-[0.16em] uppercase text-gold">
                    {String(i + 11).padStart(2, "0")}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "relevant")}>
                    Relevant
                  </Action>
                  <Action disabled={pending !== null} onClick={() => void feedback(row.target.id, "hidden")}>
                    Hide
                  </Action>
                  <Action disabled={pending !== null} onClick={() => void message(row.target.id)}>
                    Message
                  </Action>
                  <Action disabled={pending !== null} onClick={() => void introduce(row.target.id)}>
                    Request introduction
                  </Action>
                  <Action disabled={pending !== null} onClick={() => void circle(row.target.id, "remove-index")}>
                    Remove from Index
                  </Action>
                </div>
              </li>
            ))}
          </ol>
          )}
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
      className="action-quiet"
    >
      {children}
    </button>
  );
}
