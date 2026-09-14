"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TravelScoredMatch } from "@/lib/crossings/types";
import { MEETING_FORMATS, type MeetingFormat } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";
import { WhyMeet } from "@/components/ui/why-meet";
import { DemoMark } from "@/components/brand/demo-mark";
import { EmptyState } from "@/components/crossings/states";

export function MatchCarousel({
  matches,
  journeyId,
  canMutate,
}: {
  matches: TravelScoredMatch[];
  journeyId: string;
  canMutate: boolean;
}) {
  const [active, setActive] = useState<TravelScoredMatch | null>(null);

  if (matches.length === 0) {
    return (
      <EmptyState
        title="No eligible paths in this city yet."
        body="Hidden, paused, blocked, expired, and suspended members are never ranked."
      />
    );
  }

  return (
    <div>
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto hide-scroll px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
        {matches.map((row) => (
          <button
            key={row.target.id}
            type="button"
            onClick={() => setActive(row)}
            className="panel min-w-[82%] snap-start p-4 text-left md:min-w-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center font-serif text-lg"
                style={{ background: row.target.accent }}
              >
                {row.target.initials}
              </div>
              <p className="text-[11px] tracking-[0.16em] uppercase text-gold">
                {row.kind.replaceAll("_", " ")} · {Math.round(row.weighted * 100)}
              </p>
            </div>
            <p className="mt-4 font-serif text-2xl">{row.target.displayName}</p>
            <p className="text-sm leading-relaxed text-ivory-muted">{row.target.headline}</p>
            <WhyMeet prose={row.why} />
            {row.target.isDemo ? (
              <p className="mt-3">
                <DemoMark />
              </p>
            ) : null}
            <p className="mt-4 text-[10px] tracking-[0.14em] uppercase text-ivory-dim">
              Tap to open A Crossing
            </p>
          </button>
        ))}
      </div>
      {active ? (
        <RequestSheet
          match={active}
          journeyId={journeyId}
          canMutate={canMutate}
          onClose={() => setActive(null)}
        />
      ) : null}
    </div>
  );
}

function RequestSheet({
  match,
  journeyId,
  canMutate,
  onClose,
}: {
  match: TravelScoredMatch;
  journeyId: string;
  canMutate: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [format, setFormat] = useState<MeetingFormat>(
    (match.targetJourneyId ? "coffee" : "coffee") as MeetingFormat,
  );
  const [dates, setDates] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function send() {
    const proposedDates = dates
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    const res = await fetch("/api/crossings/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toProfileId: match.target.id,
        journeyId,
        counterpartJourneyId: match.targetJourneyId,
        format,
        proposedDates,
        note: note || undefined,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(json.ok ? "A Crossing was proposed." : json.message ?? "Could not send.");
    if (json.ok) router.refresh();
  }

  async function block() {
    await fetch("/api/crossings/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: match.target.id }),
    });
    setStatus("This person will no longer appear.");
    router.refresh();
  }

  return (
    <div className="crossings-sheet" role="dialog" aria-modal="true" aria-label="A Crossing">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="crossings-sheet-panel">
        <div className="sheet-handle md:hidden" />
        <p className="label">A Crossing</p>
        <div className="mt-4 flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center font-serif text-xl"
            style={{ background: match.target.accent }}
          >
            {match.target.initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-3xl leading-tight">{match.target.displayName}</h2>
            <p className="mt-1 text-sm text-ivory-muted">{match.target.headline}</p>
          </div>
        </div>
        <WhyMeet prose={match.why} items={match.explanations} />
        {canMutate ? (
          <div className="mt-7 grid gap-4">
            <label className="grid gap-2">
              <span className="label">Suggested meeting</span>
              <select value={format} onChange={(e) => setFormat(e.target.value as MeetingFormat)}>
                {MEETING_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Proposed dates</span>
              <input
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="2026-10-14, 2026-10-15"
              />
              <span className="text-[11px] text-ivory-dim">YYYY-MM-DD, comma separated</span>
            </label>
            <label className="grid gap-2">
              <span className="label">Short note (optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <Button onClick={() => void send()}>Propose A Crossing</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => void block()}>
                Block
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await fetch("/api/crossings/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      targetId: match.target.id,
                      journeyId,
                      signal: "not_relevant",
                    }),
                  });
                  setStatus("Removed from this ranking.");
                  router.refresh();
                }}
              >
                Not relevant
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ivory-dim">
            Open House shows synthetic demonstration data. Active members send Crossing requests.
          </p>
        )}
        {status ? <p className="mt-3 text-sm text-gold">{status}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-11 text-[11px] tracking-[0.16em] uppercase text-gold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
