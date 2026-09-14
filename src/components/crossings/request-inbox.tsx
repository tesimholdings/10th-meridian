"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { CrossingRequestRecord } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

export function RequestInbox({
  requests,
  viewerId,
  canMutate,
  names,
}: {
  requests: CrossingRequestRecord[];
  viewerId: string;
  canMutate: boolean;
  names: Record<string, string>;
}) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Record<string, string>>({});

  async function act(id: string, action: "accept" | "decline" | "reschedule") {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/crossings/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
          suggestedDates:
            action === "reschedule"
              ? [alternatives[id]].filter(Boolean)
              : undefined,
        }),
      });
      if (!res.ok) throw new Error("request");
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setNote(
        json.ok
          ? `Request ${action.replaceAll("_", " ")}.`
          : (json.message ?? "Could not respond."),
      );
      router.refresh();
    } catch {
      setNote("We couldn’t save that change. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (requests.length === 0) {
    return <p className="text-sm text-ivory-dim">No Crossing requests yet.</p>;
  }

  return (
    <ul className="grid gap-3">
      {note ? (
        <li role="status" className="text-sm text-gold">
          {note}
        </li>
      ) : null}
      {requests.map((r) => {
        const incoming = r.toProfileId === viewerId;
        return (
          <li key={r.id} className="editorial-row">
            <p className="label">
              {incoming ? "Received" : "Sent"} · {r.status.replaceAll("_", " ")}{" "}
              · {r.format}
            </p>
            <h3 className="mt-3 font-serif text-2xl">
              {names[incoming ? r.fromProfileId : r.toProfileId] ?? "A member"}
            </h3>
            <p className="mt-2 text-sm text-ivory-muted">
              {r.proposedDates.join(", ")}
              {r.note ? ` · ${r.note}` : ""}
            </p>
            {r.isDemo ? (
              <p className="mt-1 text-[10px] tracking-[0.16em] uppercase text-gold">
                SYNTHETIC DEMO
              </p>
            ) : null}
            {incoming && r.status === "proposed" && canMutate ? (
              <div className="mt-4 grid gap-2">
                <input
                  aria-label="Suggest another date"
                  type="date"
                  value={alternatives[r.id] ?? ""}
                  onChange={(e) =>
                    setAlternatives((previous) => ({
                      ...previous,
                      [r.id]: e.target.value,
                    }))
                  }
                  placeholder="Suggest another date, YYYY-MM-DD"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busy}
                    onClick={() => void act(r.id, "accept")}
                  >
                    Accept
                  </Button>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    onClick={() => void act(r.id, "decline")}
                  >
                    Decline
                  </Button>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    onClick={() => void act(r.id, "reschedule")}
                  >
                    Suggest another time
                  </Button>
                </div>
              </div>
            ) : null}
            {r.status === "accepted" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={`/member/channels?channel=${r.conversationId ?? ""}`}
                  className="quiet-link text-[11px] tracking-[0.16em] uppercase text-gold"
                >
                  Open conversation
                </a>
                <a
                  href={`/api/crossings/ics/${r.id}`}
                  className="quiet-link text-[11px] tracking-[0.16em] uppercase text-ivory-muted"
                >
                  Add to calendar
                </a>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
