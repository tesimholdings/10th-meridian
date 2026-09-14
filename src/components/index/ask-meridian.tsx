"use client";

import Link from "next/link";
import { useState } from "react";
import type { AskHit } from "@/lib/ask/meridian";
import { ASK_THE_MERIDIAN, WHO_CAN_HELP } from "@/lib/copy/ui";

export function AskTheMeridian() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AskHit[] | null>(null);
  const [pending, setPending] = useState(false);

  async function ask() {
    setPending(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const json = (await res.json()) as { hits?: AskHit[] };
    setHits(json.hits ?? []);
    setPending(false);
  }

  return (
    <section className="panel p-5 md:p-6">
      <p className="label">{ASK_THE_MERIDIAN}</p>
      <h2 className="mt-2 font-serif text-3xl">{WHO_CAN_HELP}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ivory-muted">
        Ask in plain language. The house searches offers, needs, and strengths — it does not invent people.
      </p>
      <form
        className="mt-5 grid gap-2 md:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Who can help with a quiet Lisbon host?"
          aria-label={WHO_CAN_HELP}
        />
        <button type="submit" className="action-quiet" disabled={pending}>
          Ask
        </button>
      </form>
      {hits ? (
        hits.length === 0 ? (
          <p className="mt-4 text-sm text-ivory-dim">No one in this frame. The house does not invent members.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {hits.map((hit) => (
              <li key={hit.profileId} className="border-b border-[var(--line)] pb-3">
                <Link href={`/member/members/${hit.profileId}`} className="font-serif text-xl">
                  {hit.displayName}
                </Link>
                <p className="text-sm text-ivory-muted">{hit.headline}</p>
                <p className="mt-1 text-[11px] tracking-[0.12em] uppercase text-gold">{hit.reason}</p>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}
