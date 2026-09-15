"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AskHit, AskResult } from "@/lib/ask/meridian";
import { ASK_THE_MERIDIAN } from "@/lib/copy/ui";

export function AskTheMeridian({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<AskResult | null>(null);
  const [pending, setPending] = useState(false);

  async function ask(value = query) {
    const needle = value.trim();
    if (!needle) return;
    setPending(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: needle }),
    });
    const json = (await res.json()) as AskResult;
    setResult(json);
    setPending(false);
  }

  useEffect(() => {
    if (initialQuery.trim()) void ask(initialQuery);
    // Header search lands here — show Ask results on Enter, not a second click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const hits = result?.hits ?? [];

  return (
    <section>
      <p className="text-sm text-[var(--ivory-dim)]">{ASK_THE_MERIDIAN}</p>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Who can help with Chicago introductions?"
          aria-label="Ask who can help"
        />
        <button type="submit" className="action-quiet" disabled={pending}>
          Ask
        </button>
      </form>
      {result ? (
        hits.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ivory-dim)]">
            {result.emptyReason ?? "No one in this frame. The house does not invent members."}
          </p>
        ) : (
          <div className="mt-4">
            {result.queriedPlace && result.exactCount === 0 ? (
              <p className="text-sm text-[var(--ivory-dim)]">
                No exact match in {result.queriedPlace}. Related people:
              </p>
            ) : null}
            <ul className="mt-3 grid gap-3">
              {hits.map((hit: AskHit) => (
                <li key={hit.profileId} className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div>
                    <Link href={`/member/members/${hit.profileId}`} className="font-serif text-xl">
                      {hit.displayName}
                    </Link>
                    <p className="text-sm text-[var(--ivory-dim)]">
                      {hit.city}
                      {hit.kind === "partial" ? " · partial" : ""}
                    </p>
                    <p className="mt-1 text-sm text-[var(--navy-soft)]">{hit.reason}</p>
                  </div>
                  <Link
                    href={`/member/members/${hit.profileId}`}
                    className="action-quiet shrink-0"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </section>
  );
}
