"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CityHostRecord, MeetingFormat } from "@/lib/crossings/types";
import { MEETING_FORMATS } from "@/lib/crossings/types";
import type { ProfileRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { DemoMark } from "@/components/brand/demo-mark";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import Link from "next/link";

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
  const [status, setStatus] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [types, setTypes] = useState<MeetingFormat[]>(["coffee"]);
  const [expertise, setExpertise] = useState("");
  const [welcome, setWelcome] = useState(true);
  const [max, setMax] = useState(2);

  async function save() {
    const res = await fetch("/api/crossings/hosts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        country,
        timezone,
        recurring: true,
        meetingTypes: types,
        expertise: expertise.split(",").map((s) => s.trim()).filter(Boolean),
        welcomeDirectRequests: welcome,
        maxRequestsPerWeek: max,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(json.ok ? "You are listed as a City Host." : json.message ?? "Could not save.");
    router.refresh();
  }

  return (
    <div className="grid gap-10">
      <p className="max-w-xl text-sm text-ivory-muted">{CROSSINGS_COPY.concierge}</p>
      <ul className="grid gap-4">
        {hosts.map((host) => {
          const person = profiles.find((p) => p.id === host.profileId);
          return (
            <li key={host.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="label">
                  {host.city}, {host.country}
                </p>
                {host.isDemo ? <DemoMark /> : null}
              </div>
              <p className="mt-2 font-serif text-2xl">{person?.displayName ?? "Member"}</p>
              <p className="mt-1 text-sm text-ivory-muted">{person?.headline}</p>
              <p className="mt-3 text-sm text-ivory-dim">
                {host.meetingTypes.join(", ")} · {host.expertise.join(", ")}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-gold">
                {host.welcomeDirectRequests ? "Direct requests welcome" : "Introductions preferred"} · max{" "}
                {host.maxRequestsPerWeek}/week
              </p>
              {person ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/member/members/${person.id}`} className="action-quiet">
                    View profile
                  </Link>
                  <Link href={`/member/messages?to=${person.id}`} className="action-quiet">
                    Request a welcome
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {canMutate ? (
        <section>
          <p className="label">Opt in by city</p>
          <div className="panel mt-4 grid gap-3 p-5">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Timezone" />
            <input
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Local expertise, comma separated"
            />
            <div className="flex flex-wrap gap-2">
              {MEETING_FORMATS.map((f) => (
                <Chip
                  key={f}
                  on={types.includes(f)}
                  onClick={() =>
                    setTypes((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))
                  }
                >
                  {f}
                </Chip>
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
            <Button onClick={() => void save()}>List me as a City Host</Button>
            {status ? <p className="text-sm text-gold">{status}</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
