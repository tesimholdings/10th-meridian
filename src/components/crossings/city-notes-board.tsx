"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
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
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
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
    () =>
      notes.filter(
        (n) =>
          (kind === "all" || n.kind === kind) &&
          `${n.city} ${n.country}`
            .toLowerCase()
            .includes(cityFilter.trim().toLowerCase()),
      ),
    [notes, kind, cityFilter],
  );

  async function act(id: string, action: "save" | "report" | "hide") {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/crossings/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reason: "member report" }),
      });
      if (!res.ok) throw new Error("request");
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.ok ? "Noted." : (json.message ?? "Could not update."));
      router.refresh();
    } catch {
      setStatus("We couldn’t save that change. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function create() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/crossings/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("request");
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(
        json.ok
          ? "City Note saved for members."
          : (json.message ?? "Could not save."),
      );
      router.refresh();
    } catch {
      setStatus("We couldn’t save that change. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8">
      <label className="grid gap-2">
        <span className="label">Explore a city</span>
        <input
          value={cityFilter}
          onChange={(event) => setCityFilter(event.target.value)}
          placeholder="Search city or country"
        />
      </label>
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
      {status ? (
        <p role="status" className="text-sm text-gold">
          {status}
        </p>
      ) : null}
      {filtered.length === 0 ? (
        <EmptyState
          title="A discovery waiting to happen."
          body="No notes match these filters. Try another city or category, or share a discovery of your own."
        />
      ) : (
        <ul className="city-notes-list grid gap-4">
          {filtered.map((note) => {
            const author = profiles.find((p) => p.id === note.authorProfileId);
            return (
              <li key={note.id} className="editorial-row">
                <p className="label">
                  {note.kind} · {note.city}
                  {note.neighborhood ? ` · ${note.neighborhood}` : ""}
                </p>
                <h2 className="mt-2 font-serif text-2xl">{note.title}</h2>
                <p className="mt-2 text-sm text-ivory-muted">{note.body}</p>
                <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-gold">
                  {author?.displayName ?? "Member"} ·{" "}
                  {note.isDemo ? "SYNTHETIC DEMO" : ""}
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
          <form
            className="crossings-form mt-4 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void create();
            }}
          >
            <label className="grid gap-2">
              <span className="label">Title</span>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Title"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Your recommendation</span>
              <textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="A careful recommendation. Neighborhood, not an address."
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label">City</span>
                <input
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  placeholder="City"
                />
              </label>
              <label className="grid gap-2">
                <span className="label">Neighborhood</span>
                <input
                  value={draft.neighborhood}
                  onChange={(e) =>
                    setDraft({ ...draft, neighborhood: e.target.value })
                  }
                  placeholder="Neighborhood"
                />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="label">Country</span>
              <input
                value={draft.country}
                onChange={(event) =>
                  setDraft({ ...draft, country: event.target.value })
                }
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Category</span>
              <select
                value={draft.kind}
                onChange={(e) =>
                  setDraft({ ...draft, kind: e.target.value as CityNoteKind })
                }
              >
                {CITY_NOTE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <PrivacyNotice />
            <Button disabled={busy} type="submit">
              Publish to members
            </Button>
          </form>
        </section>
      ) : (
        <p className="text-sm text-ivory-dim">
          Open House may only see labeled SYNTHETIC DEMO notes. Real City Notes
          stay inside the house.
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
      aria-pressed={on}
      className={`choice-chip min-h-11 px-3 text-[10px] tracking-[0.16em] uppercase ${
        on
          ? "border border-[var(--gold)] text-gold"
          : "border border-[var(--line)] text-ivory-muted"
      }`}
    >
      {children}
    </button>
  );
}
