"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { IntroRequest } from "@/lib/data/types";
import {
  ASK_COPY,
  ASK_INTENT_LABELS,
  ASK_INTENTS,
  type AskFilters,
  type AskIndex,
  type AskIntent,
} from "@/lib/matching/ask/types";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { AskResults } from "@/components/ask/ask-results";

export function AskPanel({
  intros,
  initial,
  variant = "page",
  openHouseIsolation,
}: {
  intros: IntroRequest[];
  initial?: AskIndex | null;
  variant?: "page" | "embed";
  openHouseIsolation?: boolean;
}) {
  const [query, setQuery] = useState(initial && !initial.emptyQuery ? initial.ask.query : "");
  const [intents, setIntents] = useState<AskIntent[]>(
    initial && !initial.emptyQuery ? initial.ask.intents : [],
  );
  const [filters, setFilters] = useState<AskFilters>(initial?.ask.filters ?? {});
  const [refine, setRefine] = useState(false);
  const [index, setIndex] = useState<AskIndex | null>(initial && !initial.emptyQuery ? initial : null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const privacy = useMemo(
    () =>
      openHouseIsolation
        ? "Open House is SYNTHETIC DEMO only. Real members are never shown."
        : "Private, not indexed. The house does not invent people. Relevant / not relevant feeds the ranking.",
    [openHouseIsolation],
  );

  function toggleIntent(intent: AskIntent) {
    setIntents((current) =>
      current.includes(intent) ? current.filter((i) => i !== intent) : [...current, intent],
    );
  }

  function ask() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, intents, filters }),
      });
      const json = (await res.json()) as AskIndex & { ok?: boolean; message?: string };
      if (!json.ok) {
        setError(json.message ?? "The Index could not complete that.");
        return;
      }
      setIndex(json);
    });
  }

  return (
    <div>
      <div className={variant === "page" ? "relative overflow-hidden border border-[var(--line)] water p-6 md:p-8" : ""}>
        <p className="label">{ASK_COPY.subtitle}</p>
        <h1 className="mt-3 max-w-xl font-serif text-4xl leading-[0.95] md:text-5xl">{ASK_COPY.name}</h1>
        <p className="mt-4 max-w-lg text-ivory-muted">{ASK_COPY.line}</p>
        {variant === "page" ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ivory-dim">{ASK_COPY.support}</p>
        ) : null}
        <label className="mt-6 grid gap-1">
          <span className="label">What I need help with</span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ASK_COPY.placeholder}
            aria-label="What I need help with"
            rows={3}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {ASK_INTENTS.map((intent) => (
            <Chip key={intent} on={intents.includes(intent)} onClick={() => toggleIntent(intent)}>
              {ASK_INTENT_LABELS[intent]}
            </Chip>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" disabled={pending} onClick={() => ask()}>
            {pending ? "Reading…" : "Ask"}
          </Button>
          <button
            type="button"
            className="min-h-11 text-[11px] tracking-[0.16em] uppercase text-gold"
            onClick={() => setRefine((v) => !v)}
          >
            {refine ? "Hide filters" : "Refine filters"}
          </button>
          {variant === "embed" ? (
            <Link
              href="/member/ask"
              className="min-h-11 text-[11px] tracking-[0.16em] uppercase text-ivory-dim"
            >
              Open Ask the Meridian
            </Link>
          ) : null}
        </div>
        {refine ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FilterField
              label="Location"
              value={filters.location ?? ""}
              onChange={(location) => setFilters((f) => ({ ...f, location }))}
              placeholder="New York, Chicago…"
            />
            <FilterField
              label="Industry"
              value={filters.industry ?? ""}
              onChange={(industry) => setFilters((f) => ({ ...f, industry }))}
              placeholder="Fintech, culture…"
            />
            <FilterField
              label="Availability"
              value={filters.availability ?? ""}
              onChange={(availability) => setFilters((f) => ({ ...f, availability }))}
              placeholder="open, selective…"
            />
            <FilterField
              label="Offer tag"
              value={filters.offer ?? ""}
              onChange={(offer) => setFilters((f) => ({ ...f, offer }))}
              placeholder="introductions, counsel…"
            />
            <FilterField
              label="Need tag"
              value={filters.need ?? ""}
              onChange={(need) => setFilters((f) => ({ ...f, need }))}
              placeholder="Their stated need"
            />
          </div>
        ) : null}
        <p className="mt-5 text-[11px] leading-relaxed tracking-[0.04em] text-ivory-dim">{privacy}</p>
      </div>

      {error ? (
        <p className="mt-6 text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        <AskResults index={index} intros={intros} loading={pending} />
      </div>
    </div>
  );
}

function FilterField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
