"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProfilePrivacy } from "@/lib/data/types";

const fields: { key: keyof ProfilePrivacy; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "gallery", label: "Work / portfolio gallery" },
  { key: "offers", label: "Offers" },
  { key: "needs", label: "Needs" },
  { key: "strengths", label: "Strengths" },
  { key: "events", label: "Upcoming events" },
];

export function PrivacyControls({ privacy }: { privacy: ProfilePrivacy }) {
  const router = useRouter();
  const [draft, setDraft] = useState(privacy);
  const [note, setNote] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privacy: draft }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setNote(json.ok ? "Privacy saved. Profiles are never public or indexed." : "Could not save.");
    router.refresh();
  }

  return (
    <section className="mt-10">
      <p className="label">Privacy</p>
      <p className="mt-2 text-sm text-ivory-muted">
        Name, role, organization, and city remain visible to members. Optional fields can be held back.
        Profiles are never public and never indexed.
      </p>
      <ul className="mt-4 grid gap-2">
        {fields.map((field) => (
          <li key={field.key}>
            <label className="flex min-h-11 items-center justify-between gap-3 border-b border-[var(--line)] py-2">
              <span>{field.label}</span>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={draft[field.key]}
                onChange={(e) => setDraft({ ...draft, [field.key]: e.target.checked })}
              />
            </label>
          </li>
        ))}
      </ul>
      <button type="button" className="action-quiet mt-4" onClick={() => void save()}>
        Save privacy
      </button>
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
    </section>
  );
}
