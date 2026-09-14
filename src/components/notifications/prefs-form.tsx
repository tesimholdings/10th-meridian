"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HouseNotificationPrefs, NotifyChannel } from "@/lib/network/types";

const rows: { key: keyof Omit<HouseNotificationPrefs, "profileId" | "digest">; label: string }[] = [
  { key: "channelJoin", label: "New person in a channel" },
  { key: "circle", label: "Added to Your Circle" },
  { key: "index", label: "Added to your Index" },
  { key: "intros", label: "Introductions" },
  { key: "events", label: "Events" },
  { key: "announcements", label: "Announcements" },
];

export function HouseNotificationPrefsForm({ prefs }: { prefs: HouseNotificationPrefs }) {
  const router = useRouter();
  const [draft, setDraft] = useState(prefs);
  const [note, setNote] = useState<string | null>(null);

  function setChannel(key: (typeof rows)[number]["key"], patch: Partial<NotifyChannel>) {
    setDraft({ ...draft, [key]: { ...draft[key], ...patch } });
  }

  async function save() {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "prefs",
        channelJoin: draft.channelJoin,
        circle: draft.circle,
        index: draft.index,
        intros: draft.intros,
        events: draft.events,
        announcements: draft.announcements,
        digest: draft.digest,
      }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setNote(json.ok ? "Preferences saved. Low volume. No spam." : "Could not save.");
    router.refresh();
  }

  return (
    <div>
      <p className="text-sm text-ivory-muted">
        Choose in-app, email, or a digest. Crossing notices remain in Settings below. Elegant, low-volume.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] tracking-[0.16em] uppercase text-gold">
              <th className="py-2 font-normal">Notice</th>
              <th className="py-2 font-normal">In-app</th>
              <th className="py-2 font-normal">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--line)]">
                <td className="py-3">{row.label}</td>
                <td>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={draft[row.key].inApp}
                    onChange={(e) => setChannel(row.key, { inApp: e.target.checked })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={draft[row.key].email}
                    onChange={(e) => setChannel(row.key, { email: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="mt-6 grid gap-2">
        <span className="label">Digest</span>
        <select
          value={draft.digest}
          onChange={(e) => setDraft({ ...draft, digest: e.target.value as HouseNotificationPrefs["digest"] })}
        >
          <option value="off">off</option>
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
        </select>
      </label>
      <button type="button" className="action-quiet mt-4" onClick={() => void save()}>
        Save preferences
      </button>
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
    </div>
  );
}
