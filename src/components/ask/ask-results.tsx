"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IntroRequest } from "@/lib/data/types";
import {
  memberMessagePath,
  memberProfilePath,
  type AskIndex,
  type ScoredAskMatch,
} from "@/lib/matching/ask/types";
import { DemoMark } from "@/components/brand/demo-mark";
import { EmptyState, LoadingState } from "@/components/crossings/states";
import { WhyMeet } from "@/components/ui/why-meet";

export function AskResults({
  index,
  intros,
  loading,
}: {
  index: AskIndex | null;
  intros: IntroRequest[];
  loading?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [rows, setRows] = useState(index?.people ?? []);

  useEffect(() => {
    setRows(index?.people ?? []);
  }, [index]);

  if (loading) {
    return <LoadingState label="Reading the Index…" />;
  }

  if (!index) {
    return (
      <EmptyState
        title="The house is listening."
        body="Say what you need. We’ll show who can help — from the Meridian Index, never invented."
      />
    );
  }

  if (index.emptyQuery) {
    return (
      <EmptyState
        title="Say what you need."
        body="A blank ask does not invent people. Write a need, or choose an intent."
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No one in this frame."
        body={
          index.openHouseIsolation
            ? "Open House shows SYNTHETIC DEMO people only. Widen the ask, or drop a filter. The house does not invent members."
            : "No one in the Index meets that need. Widen the ask, or drop a filter. People are never invented."
        }
      />
    );
  }

  async function feedback(targetId: string, signal: "relevant" | "not_relevant" | "hidden" | "saved") {
    if (!index) return;
    setPending(targetId + signal);
    await fetch("/api/ask/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ askId: index.ask.id, targetId, signal }),
    });
    setPending(null);
    if (signal === "hidden" || signal === "not_relevant") {
      setRows((current) => current.filter((m) => m.target.id !== targetId));
      setNote("Removed from the Index.");
    } else if (signal === "saved") {
      setRows((current) =>
        current.map((m) => (m.target.id === targetId ? { ...m, saved: true } : m)),
      );
      setNote("Saved.");
    } else {
      setNote("Marked relevant.");
    }
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

  return (
    <div>
      {note ? <p className="mb-4 text-sm text-gold">{note}</p> : null}
      <p className="label">Who can help</p>
      <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-ivory-dim">
        {rows.length} in the Index ·{" "}
        {index.openHouseIsolation ? "Open House · SYNTHETIC DEMO only" : "SYNTHETIC DEMO · never invented"}
      </p>
      <ol className="mt-6 grid gap-4">
        {rows.map((row, i) => (
          <AskResultCard
            key={row.target.id}
            row={row}
            rank={i + 1}
            intro={intros.find((x) => x.targetId === row.target.id)}
            pending={pending}
            onFeedback={feedback}
            onIntroduce={introduce}
          />
        ))}
      </ol>
    </div>
  );
}

function AskResultCard({
  row,
  rank,
  intro,
  pending,
  onFeedback,
  onIntroduce,
}: {
  row: ScoredAskMatch;
  rank: number;
  intro?: IntroRequest;
  pending: string | null;
  onFeedback: (targetId: string, signal: "relevant" | "not_relevant" | "hidden" | "saved") => void;
  onIntroduce: (targetId: string) => void;
}) {
  const profileHref = memberProfilePath(row.target.id, "ask");
  return (
    <li className="panel p-4 md:p-5">
      <div className="grid grid-cols-[auto_1fr] gap-4">
        <Link
          href={profileHref}
          className="flex h-16 w-16 items-center justify-center font-serif text-xl"
          style={{ background: row.target.accent }}
          aria-label={`Open profile, ${row.target.displayName}`}
        >
          {row.target.initials}
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link href={profileHref} className="font-serif text-2xl">
              {row.target.displayName}
            </Link>
            <p className="text-[11px] tracking-[0.18em] uppercase text-gold">
              {String(rank).padStart(2, "0")} · {Math.round(row.weighted * 100)}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-ivory-muted">{row.target.headline}</p>
          <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
            {row.source === "human_curated" ? "Human-curated" : "Algorithmic signal"}
            {row.saved ? " · Saved" : ""}
            {intro ? ` · Intro ${intro.status}` : ""}
          </p>
          {row.target.isDemo ? (
            <p className="mt-2">
              <DemoMark />
            </p>
          ) : null}
          <WhyMeet items={row.explanations} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={profileHref} className="action-quiet inline-flex items-center">
              Open profile
            </Link>
            <Link
              href={memberMessagePath(row.target.id)}
              className="action-quiet inline-flex items-center"
            >
              Message
            </Link>
            <Action disabled={pending !== null} onClick={() => onIntroduce(row.target.id)}>
              {intro ? "Requested" : "Request introduction"}
            </Action>
            <Action disabled={pending !== null} onClick={() => onFeedback(row.target.id, "relevant")}>
              Relevant
            </Action>
            <Action disabled={pending !== null} onClick={() => onFeedback(row.target.id, "not_relevant")}>
              Not relevant
            </Action>
            <Action disabled={pending !== null} onClick={() => onFeedback(row.target.id, "saved")}>
              Save
            </Action>
            <Action disabled={pending !== null} onClick={() => onFeedback(row.target.id, "hidden")}>
              Remove from Index
            </Action>
          </div>
        </div>
      </div>
    </li>
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
    <button type="button" disabled={disabled} onClick={onClick} className="action-quiet">
      {children}
    </button>
  );
}
