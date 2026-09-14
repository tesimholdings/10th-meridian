"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MatchingWeights } from "@/lib/matching/types";
import { Button } from "@/components/ui/button";

const rows: { key: keyof MatchingWeights; label: string }[] = [
  { key: "complementary", label: "Reciprocal value / complementary ask-offer" },
  { key: "goals", label: "Relevance to stated goals" },
  { key: "interests", label: "Shared interests / values" },
  { key: "industry", label: "Industry relevance or useful adjacency" },
  { key: "geography", label: "Geographic / travel compatibility" },
  { key: "preferences", label: "Connection preferences / availability" },
  { key: "novelty", label: "Network novelty / cross-pollination" },
];

export function WeightsForm({ weights }: { weights: MatchingWeights }) {
  const router = useRouter();
  const [draft, setDraft] = useState(weights);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/matching/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean; weights?: MatchingWeights };
    if (json.weights) setDraft(json.weights);
    setNote(json.ok ? "Weights now drive The Meridian Index in this preview." : "Could not save.");
    router.refresh();
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {rows.map((row) => (
        <label key={row.key} className="grid gap-2">
          <span className="label">{row.label}</span>
          <input
            inputMode="decimal"
            value={String(draft[row.key])}
            onChange={(e) => setDraft({ ...draft, [row.key]: Number(e.target.value) })}
          />
        </label>
      ))}
      <Button type="submit">Save weights</Button>
      {note ? <p className="text-sm text-gold">{note}</p> : null}
    </form>
  );
}
