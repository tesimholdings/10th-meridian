"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CityNoteRecord, CityNoteKind } from "@/lib/crossings/types";
import { CITY_NOTE_KINDS } from "@/lib/crossings/types";
import type { ProfileRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { EmptyState, PrivacyNotice } from "@/components/crossings/states";

export function CityNotesBoard({
  notes,
  profiles,
  viewerId,
  canMutate,
  isStaff,
}: {
  notes: CityNoteRecord[];
  profiles: ProfileRecord[];
  viewerId: string;
  canMutate: boolean;
  isStaff: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<CityNoteKind | "all">("all");
  const [status, setStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    city: "Paris",
    country: "France",
    kind: "restaurant" as CityNoteKind,
    title: "",
    body: "",
    neighborhood: "",
  });

  const filtered = useMemo(
    () => notes.filter((n) => (kind === "all" ? true : n.kind === kind)),
    [notes, kind],
  );

  async function act(id: string, action: "save" | "report" | "hide") {
    const res = await fetch("/api/crossings/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reason: "member report" }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(json.ok ? "Noted." : json.message ?? "Could not update.");
    router.refresh();
  }

  async function create() {
    const res = await fetch("/api/crossings/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(json.ok ? "City Note saved for members." : json.message ?? "Could not save.");
    router.refresh();
  }

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-2">
        <Chip on={kind === "all"} onClick={() => setKind("all")}>
          All
        </Chip>
        {CITY_NOTE_KINDS.map((k) => (
          <Chip key={k} on={kind === k} onClick={() => setKind(k)}>
            {k}
          </Chip>
        ))}
      </div>
      {status ? <p className="text-sm text-gold">{status}</p> : null}
      {filtered.length === 0 ? (
        <EmptyState
          title="No notes in this city yet."
          body="City Notes are a private member guide — never public, never Open House real data."
        />
      ) : (
        <ul className="grid gap-4">
          {filtered.map((note) => {
            const author = profiles.find((p) => p.id === note.authorProfileId);
            return (
              <li key={note.id} className="border border-[var(--line)] p-4">
                <p className="label">
                  {note.kind} · {note.city}
                  {note.neighborhood ? ` · ${note.neighborhood}` : ""}
                </p>
                <h2 className="mt-2 font-serif text-2xl">{note.title}</h2>
                <p className="mt-2 text-sm text-ivory-muted">{note.body}</p>
                <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-gold">
                  {author?.displayName ?? "Member"} · {note.isDemo ? "SYNTHETIC DEMO" : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {canMutate ? (
                    <>
                      <button
                        type="button"
                        className="min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
                        onClick={() => void act(note.id, "save")}
                      >
                        Save{note.savedBy.includes(viewerId) ? "d" : ""}
                      </button>
                      <button
                        type="button"
                        className="min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
                        onClick={() => void act(note.id, "report")}
                      >
                        Report
                      </button>
                    </>
                  ) : null}
                  {isStaff ? (
                    <button
                      type="button"
                      className="min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
                      onClick={() => void act(note.id, "hide")}
                    >
                      Hide
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canMutate ? (
        <section>
          <p className="label">Add a City Note</p>
          <div className="mt-4 grid gap-3">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="A careful recommendation. Neighborhood, not an address."
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                placeholder="City"
              />
              <input
                value={draft.neighborhood}
                onChange={(e) => setDraft({ ...draft, neighborhood: e.target.value })}
                placeholder="Neighborhood"
              />
            </div>
            <select
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as CityNoteKind })}
            >
              {CITY_NOTE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <PrivacyNotice />
            <Button onClick={() => void create()}>Publish to members</Button>
          </div>
        </section>
      ) : (
        <p className="text-sm text-ivory-dim">
          Open House may only see labeled SYNTHETIC DEMO notes. Real City Notes stay inside the house.
        </p>
      )}
    </div>
  );
}

function Chip({
  children,
  on,
  onClick,
}: {
  children: React.ReactNode;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 px-3 text-[10px] tracking-[0.16em] uppercase ${
        on ? "border border-[var(--gold)] text-gold" : "border border-[var(--line)] text-ivory-muted"
      }`}
    >
      {children}
    </button>
  );
}
