"use client";

import { destinationTimeToIso } from "@/components/crossings/local-time";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PrivacyNotice } from "@/components/crossings/states";
import {
  MEETING_FORMATS,
  TABLE_JOIN_MODES,
  type MeetingFormat,
  type TableJoinMode,
} from "@/lib/crossings/types";

export function TableForm({
  defaultCity,
  defaultCountry,
}: {
  defaultCity?: string;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [city, setCity] = useState(defaultCity ?? "");
  const [country, setCountry] = useState(defaultCountry ?? "");
  const [neighborhood, setNeighborhood] = useState("");
  const [venuePrivate, setVenuePrivate] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [timezone, setTimezone] = useState("");
  const [mealType, setMealType] = useState<MeetingFormat>("dinner");
  const [theme, setTheme] = useState("");
  const [maxGuests, setMaxGuests] = useState(6);
  const [joinMode, setJoinMode] = useState<TableJoinMode>("request");
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/crossings/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          country,
          neighborhood,
          venuePrivate: venuePrivate || undefined,
          dateTime: destinationTimeToIso(dateTime, timezone),
          timezone,
          mealType,
          theme: theme || undefined,
          maxGuests,
          joinMode,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        table?: { id: string };
      };
      if (!res.ok || !json.ok || !json.table) {
        setStatus(json.message ?? "Could not open a table.");
        return;
      }
      router.push(`/member/crossings/tables/${json.table?.id}`);
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof TypeError
          ? "Connection interrupted. Your table details are still here—please try again."
          : error instanceof Error
            ? error.message
            : "Your table couldn’t be saved. Please try again.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      className="crossings-form grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <p className="text-sm text-ivory-muted">
        Neighborhood, never a public address. Exact venue is revealed only to
        confirmed guests.
      </p>
      <label className="grid gap-2">
        <span className="label">City</span>
        <input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Country</span>
        <input
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Neighborhood</span>
        <input
          required
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Marylebone"
        />
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
        <span className="label">Date and time at the destination</span>
        <input
          required
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Timezone</span>
        <input
          required
          placeholder="Europe/London"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Meal</span>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MeetingFormat)}
        >
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
          type="number"
          min={3}
          max={8}
          inputMode="numeric"
          value={String(maxGuests)}
          onChange={(e) => setMaxGuests(Number(e.target.value) || 3)}
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Join</span>
        <select
          value={joinMode}
          onChange={(e) => setJoinMode(e.target.value as TableJoinMode)}
        >
          {TABLE_JOIN_MODES.map((m) => (
            <option key={m} value={m}>
              {m === "request" ? "Request to join" : "Invitation only"}
            </option>
          ))}
        </select>
      </label>
      <PrivacyNotice />
      <Button type="submit" disabled={busy}>
        {busy ? "Opening your table…" : "Open a Table"}
      </Button>
      {status ? (
        <p role="status" className="text-sm text-gold">
          {status}
        </p>
      ) : null}
    </form>
  );
}
