"use client";

import { useState } from "react";

type SeedChannel = { name: string; cid: string; seeded?: boolean; error?: string };

export function StreamSeedButton({
  streamLive,
  webPush,
}: {
  streamLive: boolean;
  webPush: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [channels, setChannels] = useState<SeedChannel[] | null>(null);

  async function seed() {
    setPending(true);
    setNote(null);
    try {
      const res = await fetch("/api/stream/seed", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        stub?: boolean;
        note?: string;
        channels?: SeedChannel[];
      };
      setChannels(json.channels ?? null);
      setNote(json.note ?? (json.ok ? "House channels are ready." : "Seed did not finish."));
    } catch {
      setNote("Seed did not finish.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel-quiet mt-8 p-4">
      <p className="label">Stream</p>
      <p className="mt-2 font-serif text-2xl">{streamLive ? "Keys present" : "Stub"}</p>
      <p className="mt-2 text-sm text-ivory-muted">
        House channels: announcements, introductions, ask-and-offer, opportunities, events, travel, ideas.
        Web Push is {webPush ? "configured" : "not configured"}. Seeding again is safe.
      </p>
      <button
        type="button"
        className="mt-4 min-h-11 rounded-full border border-[var(--line)] px-4 text-sm"
        disabled={pending}
        onClick={() => void seed()}
      >
        {pending ? "Seeding…" : "Seed house channels"}
      </button>
      {note ? <p className="mt-3 text-sm text-ivory-muted">{note}</p> : null}
      {channels ? (
        <ul className="mt-3 space-y-1 text-sm text-ivory-muted">
          {channels.map((channel) => (
            <li key={channel.cid}>
              {channel.name} · {channel.cid}
              {channel.seeded ? "" : channel.error ? ` · ${channel.error}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
