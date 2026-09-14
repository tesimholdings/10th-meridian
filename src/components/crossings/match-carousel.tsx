"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { TravelScoredMatch } from "@/lib/crossings/types";
import { MEETING_FORMATS, type MeetingFormat } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

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
      <p className="text-sm text-ivory-dim">
        No relevant paths in this city yet. Your journey is ready; explore
        another destination or refine your meeting preferences.
      </p>
    );
  }

  return (
    <div>
      <div className="travel-matches -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
        {matches.map((row) => (
          <button
            key={row.target.id}
            type="button"
            onClick={() => setActive(row)}
            className="travel-match min-w-[84%] snap-start text-left md:min-w-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="member-avatar flex h-12 w-12 items-center justify-center font-serif text-lg"
                style={{ background: row.target.accent }}
              >
                {row.target.initials}
              </div>
              <p className="text-[11px] tracking-[0.16em] uppercase text-gold">
                {row.kind.replaceAll("_", " ")} ·{" "}
                {Math.round(row.weighted * 100)}
              </p>
            </div>
            <p className="mt-3 font-serif text-2xl">{row.target.displayName}</p>
            <p className="text-sm text-ivory-muted">{row.target.headline}</p>
            <p className="label mt-4">Why you should meet</p>
            <p className="mt-1 text-sm text-ivory-muted">{row.why}</p>
            {row.target.isDemo ? (
              <p className="mt-2 text-[10px] tracking-[0.16em] uppercase text-gold">
                SYNTHETIC DEMO
              </p>
            ) : null}
            <p className="mt-3 text-[10px] tracking-[0.14em] uppercase text-ivory-dim">
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
  const [dates, setDates] = useState<string[]>([""]);
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const sending = useRef(false);
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function send() {
    if (sending.current || sent) return;
    sending.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const proposedDates = dates.filter(Boolean);
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
      setStatus(
        res.ok && json.ok
          ? "A Crossing was proposed. We’ll let you know when they respond."
          : (json.message ?? "Could not send."),
      );
      if (res.ok && json.ok) {
        setSent(true);
        router.refresh();
      }
    } catch {
      setStatus(
        "Your request wasn’t sent. Your dates and note are still here—please try again.",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  async function updatePreference(block: boolean) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(
        block ? "/api/crossings/block" : "/api/crossings/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            block
              ? { profileId: match.target.id }
              : {
                  targetId: match.target.id,
                  journeyId,
                  signal: "not_relevant",
                },
          ),
        },
      );
      if (!res.ok) throw new Error("preference");
      router.refresh();
      onClose();
    } catch {
      setStatus("That preference couldn’t be saved. Please try again.");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="crossings-dialog"
      aria-label="A Crossing"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="label">A Crossing</p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="min-h-11 px-2 text-[11px] tracking-[0.16em] uppercase text-gold"
          >
            Close
          </button>
        </div>
        <h2 className="mt-2 font-serif text-3xl">{match.target.displayName}</h2>
        <p className="mt-2 text-sm text-ivory-muted">{match.why}</p>
        <ul className="mt-4 grid gap-1 text-sm text-ivory-muted">
          {match.explanations.map((e) => (
            <li key={e.pillar}>
              <span className="text-gold">{e.pillar}.</span> {e.text}
            </li>
          ))}
        </ul>
        {canMutate ? (
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <label className="grid gap-2">
              <span className="label">Suggested meeting</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as MeetingFormat)}
              >
                {MEETING_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="grid gap-3">
              <legend className="label mb-3">Dates that work for you</legend>
              {dates.map((date, i) => (
                <label key={i} className="grid gap-2">
                  <span className="text-sm text-ivory-muted">
                    Proposed date {i + 1}
                  </span>
                  <input
                    type="date"
                    required={i === 0}
                    value={date}
                    onChange={(event) =>
                      setDates((previous) =>
                        previous.map((value, index) =>
                          index === i ? event.target.value : value,
                        ),
                      )
                    }
                  />
                </label>
              ))}
              {dates.length < 3 ? (
                <button
                  className="quiet-link text-gold"
                  type="button"
                  onClick={() => setDates((previous) => [...previous, ""])}
                >
                  + Add another date
                </button>
              ) : null}
            </fieldset>
            <label className="grid gap-2">
              <span className="label">Short note (optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={busy || sent}>
              {busy
                ? "One moment…"
                : sent
                  ? "Crossing proposed"
                  : "Propose A Crossing"}
            </Button>
            <div className="flex flex-wrap gap-5 border-t border-[var(--line)] pt-3">
              <button
                type="button"
                disabled={busy}
                className="quiet-link text-ivory-muted"
                onClick={() => void updatePreference(true)}
              >
                Block member
              </button>
              <button
                type="button"
                disabled={busy}
                className="quiet-link text-ivory-muted"
                onClick={() => void updatePreference(false)}
              >
                Not relevant
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-6 text-sm text-ivory-dim">
            Open House shows synthetic demonstration data. Active members send
            Crossing requests.
          </p>
        )}
        {status ? (
          <p role="status" className="mt-3 text-sm text-gold">
            {status}
          </p>
        ) : null}
      </div>
    </dialog>
  );
}
