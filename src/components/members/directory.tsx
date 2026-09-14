"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProfileRecord } from "@/lib/data/types";
import { EmptyState } from "@/components/crossings/states";

const filters = [
  { key: "city", label: "Location" },
  { key: "industries", label: "Industry" },
  { key: "roleTitle", label: "Role" },
  { key: "strengths", label: "Expertise" },
  { key: "interests", label: "Interests" },
  { key: "goals", label: "Goals" },
  { key: "offers", label: "Offer" },
  { key: "needs", label: "Need" },
  { key: "travel", label: "Travel" },
  { key: "availability", label: "Availability" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export function Directory({ profiles }: { profiles: ProfileRecord[] }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState<Record<string, string>>({});
  const [refine, setRefine] = useState(false);

  const filtered = useMemo(() => {
    const hay = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (hay) {
        const blob = [
          p.displayName,
          p.headline,
          p.roleTitle,
          p.city,
          p.country,
          p.industries,
          p.strengths,
          p.interests,
          p.goals,
          p.offers,
          p.needs,
          p.travel,
          p.availability,
        ]
          .flat()
          .join(" ")
          .toLowerCase();
        if (!blob.includes(hay)) return false;
      }
      return filters.every(({ key }) => {
        const needle = (query[key] ?? "").trim().toLowerCase();
        if (!needle) return true;
        return field(p, key).toLowerCase().includes(needle);
      });
    });
  }, [profiles, query, search]);

  return (
    <div>
      <label className="grid gap-1">
        <span className="label">Search the house</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Location, industry, offer, need…"
          aria-label="Search members"
        />
      </label>
      <button
        type="button"
        className="mt-3 min-h-11 text-[11px] tracking-[0.16em] uppercase text-gold"
        onClick={() => setRefine((v) => !v)}
      >
        {refine ? "Hide filters" : "Refine filters"}
      </button>
      {refine ? (
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {filters.map((f) => (
          <label key={f.key} className="grid gap-1">
            <span className="label">{f.label}</span>
            <input
              value={query[f.key] ?? ""}
              onChange={(e) => setQuery((q) => ({ ...q, [f.key]: e.target.value }))}
              placeholder="Filter"
            />
          </label>
        ))}
      </div>
      ) : null}
      <p className="mt-4 text-[11px] tracking-[0.16em] uppercase text-ivory-dim">
        {filtered.length} SYNTHETIC DEMO · never invented
      </p>
      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No one in this frame."
            body="Filters stay on this device. Widen the search — the house does not invent members."
          />
        </div>
      ) : (
      <ul className="mt-6 grid gap-4">
        {filtered.map((p) => (
          <li key={p.id} className="panel grid grid-cols-[auto_1fr] gap-4 p-4">
            <div
              className="flex h-16 w-16 items-center justify-center font-serif text-xl"
              style={{ background: p.accent }}
            >
              {p.initials}
            </div>
            <div>
              <p className="font-serif text-2xl">{p.displayName}</p>
              <p className="text-sm text-ivory-muted">
                {p.headline} · {p.city}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-gold">
                SYNTHETIC DEMO
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/member/members/${p.id}`}
                  className="inline-flex min-h-11 items-center border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
                >
                  Open profile
                </Link>
                <Link
                  href={`/member/members/${p.id}#message`}
                  className="inline-flex min-h-11 items-center border border-[var(--line)] px-3 text-[10px] tracking-[0.16em] uppercase"
                >
                  Message
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

function field(p: ProfileRecord, key: FilterKey): string {
  if (key === "city") return `${p.city} ${p.country} ${p.geography.join(" ")}`;
  if (key === "roleTitle") return p.roleTitle;
  if (key === "availability") return p.availability;
  return (p[key] as string[]).join(" ");
}
