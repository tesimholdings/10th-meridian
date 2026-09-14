"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CrossingRequestRecord } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";
import { DemoMark } from "@/components/brand/demo-mark";
import { EmptyState } from "@/components/crossings/states";

export function RequestInbox({
  requests,
  viewerId,
  canMutate,
}: {
  requests: CrossingRequestRecord[];
  viewerId: string;
  canMutate: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  async function act(id: string, action: "accept" | "decline" | "reschedule") {
    const res = await fetch("/api/crossings/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action,
        suggestedDates: action === "reschedule" ? alt.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
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
        body="When a path overlaps, a Crossing can be proposed — city-level only, never a pin."
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {note ? <p className="text-sm text-gold">{note}</p> : null}
      {requests.map((r) => {
        const incoming = r.toProfileId === viewerId;
        return (
          <li key={r.id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label">
                {incoming ? "Received" : "Sent"} · {r.status.replaceAll("_", " ")} · {r.format}
              </p>
              {r.isDemo ? <DemoMark /> : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ivory-muted">
              {r.proposedDates.join(", ")}
              {r.note ? ` · ${r.note}` : ""}
            </p>
            {incoming && r.status === "proposed" && canMutate ? (
              <div className="mt-4 grid gap-2">
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Suggest another date, YYYY-MM-DD"
                />
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
                  href={`/member/channels?channel=${r.conversationId ?? ""}`}
                  className="inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-gold"
                >
                  Open conversation
                </a>
                <a
                  href={`/api/crossings/ics/${r.id}`}
                  className="inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-ivory-muted"
                >
                  Download .ics
                </a>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
