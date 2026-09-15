"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CityNoteRecord, CityNoteKind } from "@/lib/crossings/types";
import { CITY_NOTE_KINDS } from "@/lib/crossings/types";
import type { ProfileRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { DemoMark } from "@/components/brand/demo-mark";
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
  const [city, setCity] = useState<string>("all");
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

  const cities = useMemo(
    () => [...new Set(notes.map((n) => n.city).filter(Boolean))].sort(),
    [notes],
  );
  const filtered = useMemo(
    () =>
      notes.filter((n) => {
        if (city !== "all" && n.city !== city) return false;
        if (kind !== "all" && n.kind !== kind) return false;
        return true;
      }),
    [notes, city, kind],
  );
  const filterCity = city === "all" ? null : city;
  const filterKind = kind === "all" ? null : kind;

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
        <Chip on={city === "all"} onClick={() => setCity("all")}>
          All cities
        </Chip>
        {cities.map((c) => (
          <Chip key={c} on={city === c} onClick={() => setCity(c)}>
            {c}
          </Chip>
        ))}
      </div>
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
          title={
            filterCity && filterKind
              ? `No ${filterKind} notes in ${filterCity} yet.`
              : filterCity
                ? `No notes in ${filterCity} yet.`
                : filterKind
                  ? `No ${filterKind} notes yet.`
                  : "No notes yet."
          }
          body="City Notes are a private member guide — never public, never Open House real data."
          action={
            filterCity || filterKind ? (
              <button
                type="button"
                className="action-quiet"
                onClick={() => {
                  setCity("all");
                  setKind("all");
                }}
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-4">
          {filtered.map((note) => {
            const author = profiles.find((p) => p.id === note.authorProfileId);
            return (
              <li key={note.id} className="panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="label">
                    {note.kind} · {note.city}
                    {note.neighborhood ? ` · ${note.neighborhood}` : ""}
                  </p>
                  {note.isDemo ? <DemoMark /> : null}
                </div>
                <h2 className="mt-3 font-serif text-2xl">{note.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{note.body}</p>
                <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
                  {author?.displayName ?? "Member"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {canMutate ? (
                    <>
                      <button
                        type="button"
                        className="action-quiet"
                        onClick={() => void act(note.id, "save")}
                      >
                        Save{note.savedBy.includes(viewerId) ? "d" : ""}
                      </button>
                      <button
                        type="button"
                        className="action-quiet"
                        onClick={() => void act(note.id, "report")}
                      >
                        Report
                      </button>
                    </>
                  ) : null}
                  {isStaff ? (
                    <button
                      type="button"
                      className="action-quiet"
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
          <div className="panel mt-4 grid gap-3 p-5">
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
