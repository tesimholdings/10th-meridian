"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TravelMatchWeights } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

const rows: { key: keyof TravelMatchWeights; label: string }[] = [
  { key: "meridian", label: "Existing Meridian Index compatibility (40%)" },
  { key: "overlap", label: "Date and destination overlap (25%)" },
  { key: "intent", label: "Meeting-intent compatibility (15%)" },
  { key: "complementary", label: "Reciprocal ask-and-offer value (10%)" },
  { key: "availability", label: "Availability and connection preferences (10%)" },
];

export function TravelWeightsForm({ weights }: { weights: TravelMatchWeights }) {
  const router = useRouter();
  const [draft, setDraft] = useState(weights);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/crossings/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean; weights?: TravelMatchWeights };
    if (json.weights) setDraft(json.weights);
    setNote(json.ok ? "Travel weights now drive Crossings in this preview." : "Could not save.");
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
      <Button type="submit">Save travel weights</Button>
      {note ? <p className="text-sm text-gold">{note}</p> : null}
    </form>
  );
}
