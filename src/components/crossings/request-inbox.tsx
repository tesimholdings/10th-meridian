"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CrossingRequestRecord, JourneyRecord } from "@/lib/crossings/types";
import type { ProfileRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/crossings/states";
import { formatHumanDate, formatHumanDateRange } from "@/lib/crossings/format";
import { messageHref } from "@/lib/messaging/destination";

export function RequestInbox({
  requests,
  viewerId,
  canMutate,
  profiles = [],
  journeys = [],
}: {
  requests: CrossingRequestRecord[];
  viewerId: string;
  canMutate: boolean;
  profiles?: ProfileRecord[];
  journeys?: JourneyRecord[];
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const [alts, setAlts] = useState<Record<string, string>>({});

  async function act(id: string, action: "accept" | "decline" | "reschedule") {
    const res = await fetch("/api/crossings/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action,
        suggestedDates: action === "reschedule" && alts[id] ? [alts[id]] : undefined,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setNote(json.ok ? `Request ${action.replaceAll("_", " ")}.` : json.message ?? "Could not respond.");
    router.refresh();
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No Crossing requests yet."
        body="When a path overlaps, a Crossing can be proposed — city-level only."
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {note ? <p className="text-sm text-[var(--gold)]">{note}</p> : null}
      {requests.map((r) => {
        const incoming = r.toProfileId === viewerId;
        const otherId = incoming ? r.fromProfileId : r.toProfileId;
        const person = profiles.find((p) => p.id === otherId);
        const journey = journeys.find((j) => j.id === r.journeyId);
        const dates =
          r.proposedDates.length > 1
            ? formatHumanDateRange(r.proposedDates[0], r.proposedDates[r.proposedDates.length - 1])
            : r.proposedDates[0]
              ? formatHumanDate(r.proposedDates[0])
              : "";
        return (
          <li key={r.id} className="py-3">
            <p className="font-serif text-2xl">{person?.displayName ?? "A member"}</p>
            <p className="mt-1 text-sm text-[var(--navy-soft)]">
              {r.format}
              {journey ? ` in ${journey.destinationCity}` : ""}
              {dates ? ` · ${dates}` : ""}
            </p>
            {r.note ? <p className="mt-2 text-sm text-[var(--ivory-dim)]">{r.note}</p> : null}
            {incoming && r.status === "proposed" && canMutate ? (
              <div className="mt-4 grid gap-2">
                <label className="grid gap-1">
                  <span className="text-sm">Suggest another date</span>
                  <input
                    type="date"
                    value={alts[r.id] ?? ""}
                    onChange={(e) => setAlts((s) => ({ ...s, [r.id]: e.target.value }))}
                    aria-label="Reschedule date"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void act(r.id, "accept")}>Accept</Button>
                  <Button variant="ghost" onClick={() => void act(r.id, "decline")}>
                    Decline
                  </Button>
                  <Button variant="ghost" onClick={() => void act(r.id, "reschedule")}>
                    Suggest another time
                  </Button>
                </div>
              </div>
            ) : null}
            {r.status === "accepted" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={messageHref({ channelId: r.conversationId, profileId: otherId })}
                  className="text-sm text-[var(--blue)]"
                >
                  Open conversation
                </a>
                <a href={`/api/crossings/ics/${r.id}`} className="text-sm text-[var(--ivory-dim)]">
                  Download calendar
                </a>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
