"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { TravelNotificationPref } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

export function NotificationPrefsForm({
  prefs,
}: {
  prefs: TravelNotificationPref;
}) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(prefs);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/crossings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overlapDigest: draft.overlapDigest,
          goalRelevance: draft.goalRelevance,
          tableSuggestions: draft.tableSuggestions,
          requestUpdates: draft.requestUpdates,
          digest: draft.digest,
        }),
      });
      if (!res.ok) throw new Error("request");
      const json = (await res.json()) as { ok?: boolean };
      setNote(
        json.ok
          ? "Preferences saved. Digests stay quiet — no repeats."
          : "Could not save.",
      );
      router.refresh();
    } catch {
      setNote("We couldn’t save that change. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={draft.overlapDigest}
          onChange={(e) =>
            setDraft({ ...draft, overlapDigest: e.target.checked })
          }
        />
        Overlap notices (“Three members will be in Paris while you are.”)
      </label>
      <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={draft.goalRelevance}
          onChange={(e) =>
            setDraft({ ...draft, goalRelevance: e.target.checked })
          }
        />
        Goal relevance (“A member in New York may be especially relevant…”)
      </label>
      <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={draft.tableSuggestions}
          onChange={(e) =>
            setDraft({ ...draft, tableSuggestions: e.target.checked })
          }
        />
        Table suggestions (“Four paths cross in London. Open a table?”)
      </label>
      <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={draft.requestUpdates}
          onChange={(e) =>
            setDraft({ ...draft, requestUpdates: e.target.checked })
          }
        />
        Crossing request updates
      </label>
      <label className="grid gap-2">
        <span className="label">Digest</span>
        <select
          value={draft.digest}
          onChange={(e) =>
            setDraft({
              ...draft,
              digest: e.target.value as TravelNotificationPref["digest"],
            })
          }
        >
          <option value="off">Off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      <Button disabled={busy} type="submit">
        Save notification quiet
      </Button>
      {note ? (
        <p role="status" className="text-sm text-gold">
          {note}
        </p>
      ) : null}
    </form>
  );
}
