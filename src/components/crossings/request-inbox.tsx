"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CrossingRequestRecord } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

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
    return <p className="text-sm text-ivory-dim">No Crossing requests yet.</p>;
  }

  return (
    <ul className="grid gap-3">
      {note ? <p className="text-sm text-gold">{note}</p> : null}
      {requests.map((r) => {
        const incoming = r.toProfileId === viewerId;
        return (
          <li key={r.id} className="border border-[var(--line)] p-4">
            <p className="label">
              {incoming ? "Received" : "Sent"} · {r.status.replaceAll("_", " ")} · {r.format}
            </p>
            <p className="mt-2 text-sm text-ivory-muted">
              {r.proposedDates.join(", ")}
              {r.note ? ` · ${r.note}` : ""}
            </p>
            {r.isDemo ? (
              <p className="mt-1 text-[10px] tracking-[0.16em] uppercase text-gold">SYNTHETIC DEMO</p>
            ) : null}
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
                  className="text-[11px] tracking-[0.16em] uppercase text-gold"
                >
                  Open conversation
                </a>
                <a
                  href={`/api/crossings/ics/${r.id}`}
                  className="text-[11px] tracking-[0.16em] uppercase text-ivory-muted"
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
