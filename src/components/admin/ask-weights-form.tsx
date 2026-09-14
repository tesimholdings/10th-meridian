"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AskMatchWeights } from "@/lib/matching/ask/types";
import { Button } from "@/components/ui/button";

const rows: { key: keyof AskMatchWeights; label: string }[] = [
  { key: "complementary", label: "Complementarity — their offers vs the stated need (45%)" },
  { key: "meridian", label: "Existing Meridian Index compatibility (20%)" },
  { key: "industry", label: "Industry relevance or useful adjacency (12%)" },
  { key: "geography", label: "Geographic / travel compatibility (10%)" },
  { key: "availability", label: "Availability (8%)" },
  { key: "semantic", label: "Lexical / embedding supplement (5%)" },
];

export function AskWeightsForm({ weights }: { weights: AskMatchWeights }) {
  const router = useRouter();
  const [draft, setDraft] = useState(weights);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/ask/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean; weights?: AskMatchWeights };
    if (json.weights) setDraft(json.weights);
    setNote(json.ok ? "Ask weights now drive Who can help in this preview." : "Could not save.");
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
      <Button type="submit">Save ask weights</Button>
      {note ? <p className="text-sm text-gold">{note}</p> : null}
    </form>
  );
}
