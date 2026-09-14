"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { CityHostRecord, MeetingFormat } from "@/lib/crossings/types";
import { MEETING_FORMATS } from "@/lib/crossings/types";
import type { ProfileRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { CROSSINGS_COPY } from "@/lib/crossings/types";

export function CityHostsBoard({
  hosts,
  profiles,
  canMutate,
}: {
  hosts: CityHostRecord[];
  profiles: ProfileRecord[];
  canMutate: boolean;
}) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [types, setTypes] = useState<MeetingFormat[]>(["coffee"]);
  const [expertise, setExpertise] = useState("");
  const [welcome, setWelcome] = useState(true);
  const [max, setMax] = useState(2);

  async function save() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/crossings/hosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          country,
          timezone,
          recurring: true,
          meetingTypes: types,
          expertise: expertise
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          welcomeDirectRequests: welcome,
          maxRequestsPerWeek: max,
        }),
      });
      if (!res.ok) throw new Error("request");
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(
        json.ok
          ? "You are listed as a City Host."
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
    <div className="grid gap-10">
      <p className="max-w-xl text-sm text-ivory-muted">
        {CROSSINGS_COPY.concierge}
      </p>
      <ul className="grid gap-4">
        {hosts.map((host) => {
          const person = profiles.find((p) => p.id === host.profileId);
          return (
            <li key={host.id} className="editorial-row">
              <p className="label">
                {host.city}, {host.country}
                {host.isDemo ? " · SYNTHETIC DEMO" : ""}
              </p>
              <p className="mt-2 font-serif text-2xl">
                {person?.displayName ?? "Member"}
              </p>
              <p className="mt-1 text-sm text-ivory-muted">
                {person?.headline}
              </p>
              <p className="mt-3 text-sm text-ivory-dim">
                {host.meetingTypes.join(", ")} · {host.expertise.join(", ")}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-gold">
                {host.welcomeDirectRequests
                  ? "Direct requests welcome"
                  : "Introductions preferred"}{" "}
                · max {host.maxRequestsPerWeek}/week
              </p>
            </li>
          );
        })}
      </ul>
      {canMutate ? (
        <section>
          <p className="label">Opt in by city</p>
          <form
            className="crossings-form mt-4 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <label className="grid gap-2">
              <span className="label">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Country</span>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Timezone</span>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Timezone"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Local expertise</span>
              <input
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="Local expertise, comma separated"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {MEETING_FORMATS.map((f) => (
                <button
                  key={f}
                  aria-pressed={types.includes(f)}
                  type="button"
                  onClick={() =>
                    setTypes((cur) =>
                      cur.includes(f)
                        ? cur.filter((x) => x !== f)
                        : [...cur, f],
                    )
                  }
                  className={`choice-chip min-h-11 px-3 text-[10px] tracking-[0.16em] uppercase ${
                    types.includes(f)
                      ? "border border-[var(--gold)] text-gold"
                      : "border border-[var(--line)] text-ivory-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={welcome}
                onChange={(e) => setWelcome(e.target.checked)}
              />
              Welcome direct requests
            </label>
            <label className="grid gap-2">
              <span className="label">Max requests per week</span>
              <input
                inputMode="numeric"
                value={String(max)}
                onChange={(e) => setMax(Number(e.target.value) || 1)}
              />
            </label>
            <Button disabled={busy} type="submit">
              List me as a City Host
            </Button>
            {status ? (
              <p role="status" className="text-sm text-gold">
                {status}
              </p>
            ) : null}
          </form>
        </section>
      ) : null}
    </div>
  );
}
