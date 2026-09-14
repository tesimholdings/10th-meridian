"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OpenHouseConfig } from "@/lib/access/open-house";
import { Button } from "@/components/ui/button";

export function OpenHouseForm({ config }: { config: OpenHouseConfig }) {
  const router = useRouter();
  const [draft, setDraft] = useState(config);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/admin/open-house", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean };
    setNote(json.ok ? "Schedule saved to the preview site_config path." : "Could not save.");
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
      <p className="text-sm text-ivory-muted">
        Visitor doors are 10:00–22:00 in the visitor&apos;s IANA timezone (referral 09:00 local the same day).
        The field below is the fallback when none is provided — default America/Chicago.
      </p>
      <Field label="Fallback timezone" value={draft.timeZone} onChange={(v) => setDraft({ ...draft, timeZone: v })} />
      <Field label="Day" value={String(draft.day)} onChange={(v) => setDraft({ ...draft, day: Number(v) })} />
      <Field label="Referral hour" value={String(draft.referralHour)} onChange={(v) => setDraft({ ...draft, referralHour: Number(v) })} />
      <Field label="General hour" value={String(draft.generalHour)} onChange={(v) => setDraft({ ...draft, generalHour: Number(v) })} />
      <Field label="Close hour" value={String(draft.closeHour)} onChange={(v) => setDraft({ ...draft, closeHour: Number(v) })} />
      <label className="grid gap-2">
        <span className="label">Force</span>
        <select
          value={draft.force}
          onChange={(e) => setDraft({ ...draft, force: e.target.value as OpenHouseConfig["force"] })}
        >
          <option value="auto">auto</option>
          <option value="open">open</option>
          <option value="closed">closed</option>
        </select>
      </label>
      <Button type="submit">Save schedule</Button>
      {note ? <p className="text-sm text-gold">{note}</p> : null}
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
