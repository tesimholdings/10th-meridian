"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProfileRecord } from "@/lib/data/types";
import type { MatchCuration } from "@/lib/matching/types";
import { Button } from "@/components/ui/button";

export function CurationForm({
  profiles,
  viewerId,
  curation,
}: {
  profiles: ProfileRecord[];
  viewerId: string;
  curation: MatchCuration[];
}) {
  const router = useRouter();
  const [targetId, setTargetId] = useState(profiles[1]?.id ?? "");
  const [action, setAction] = useState<"promote" | "suppress">("promote");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/admin/curation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewerId, targetId, action, reason }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setNote(json.ok ? "Curation applied and labeled in Matches." : json.message ?? "A written reason is required.");
    setReason("");
    router.refresh();
  }

  return (
    <div>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="grid gap-2">
          <span className="label">Target</span>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {profiles.filter((p) => p.id !== viewerId).map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Action</span>
          <select value={action} onChange={(e) => setAction(e.target.value as "promote" | "suppress")}>
            <option value="promote">promote</option>
            <option value="suppress">suppress</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Reason (required)</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <Button type="submit">Apply curation</Button>
      </form>
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
      <ul className="mt-8 text-sm text-ivory-muted">
        {curation.map((c) => (
          <li key={`${c.viewerId}-${c.targetId}`}>
            {c.action} · {c.targetId} · {c.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
