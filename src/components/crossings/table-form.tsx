"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PrivacyNotice } from "@/components/crossings/states";
import { MEETING_FORMATS, TABLE_JOIN_MODES, type MeetingFormat, type TableJoinMode } from "@/lib/crossings/types";

export function TableForm({
  defaultCity,
  defaultCountry,
}: {
  defaultCity?: string;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity ?? "");
  const [country, setCountry] = useState(defaultCountry ?? "");
  const [neighborhood, setNeighborhood] = useState("");
  const [venuePrivate, setVenuePrivate] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [timezone, setTimezone] = useState("Europe/London");
  const [mealType, setMealType] = useState<MeetingFormat>("dinner");
  const [theme, setTheme] = useState("");
  const [maxGuests, setMaxGuests] = useState(6);
  const [joinMode, setJoinMode] = useState<TableJoinMode>("request");
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/crossings/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        country,
        neighborhood,
        venuePrivate: venuePrivate || undefined,
        dateTime: dateTime ? new Date(dateTime).toISOString() : "",
        timezone,
        mealType,
        theme: theme || undefined,
        maxGuests,
        joinMode,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string; table?: { id: string } };
    if (!json.ok) {
      setStatus(json.message ?? "Could not open a table.");
      return;
    }
    router.push(`/member/crossings/tables/${json.table?.id}`);
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
        Neighborhood, never a public address. Exact venue is revealed only to confirmed guests.
      </p>
      <label className="grid gap-2">
        <span className="label">City</span>
        <input value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <label className="grid gap-2">
        <span className="label">Country</span>
        <input value={country} onChange={(e) => setCountry(e.target.value)} />
      </label>
      <label className="grid gap-2">
        <span className="label">Neighborhood</span>
        <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Marylebone" />
      </label>
      <label className="grid gap-2">
        <span className="label">Exact venue (confirmed guests only)</span>
        <input
          value={venuePrivate}
          onChange={(e) => setVenuePrivate(e.target.value)}
          placeholder="Never shown on the public table card"
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Date and time</span>
        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
      </label>
      <label className="grid gap-2">
        <span className="label">Timezone</span>
        <input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
      </label>
      <label className="grid gap-2">
        <span className="label">Meal</span>
        <select value={mealType} onChange={(e) => setMealType(e.target.value as MeetingFormat)}>
          {MEETING_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="label">Theme (optional)</span>
        <input value={theme} onChange={(e) => setTheme(e.target.value)} />
      </label>
      <label className="grid gap-2">
        <span className="label">Max guests</span>
        <input
          inputMode="numeric"
          value={String(maxGuests)}
          onChange={(e) => setMaxGuests(Number(e.target.value) || 3)}
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Join</span>
        <select value={joinMode} onChange={(e) => setJoinMode(e.target.value as TableJoinMode)}>
          {TABLE_JOIN_MODES.map((m) => (
            <option key={m} value={m}>
              {m === "request" ? "Request to join" : "Invitation only"}
            </option>
          ))}
        </select>
      </label>
      <PrivacyNotice />
      <Button type="submit">Open a Table</Button>
      {status ? <p className="text-sm text-gold">{status}</p> : null}
    </form>
  );
}
