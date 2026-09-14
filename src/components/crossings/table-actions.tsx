"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { GroupTableRecord } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

export function TableActions({
  table,
  viewerId,
  canMutate,
  names,
}: {
  table: GroupTableRecord;
  viewerId: string;
  canMutate: boolean;
  names: Record<string, string>;
}) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const isHost = table.openedByProfileId === viewerId;
  const mine = table.guests.find((g) => g.profileId === viewerId);

  async function join() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/crossings/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: table.id, action: "join" }),
      });
      if (!res.ok) throw new Error("request");
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setNote(
        json.ok ? "Requested a seat." : (json.message ?? "Could not join."),
      );
      router.refresh();
    } catch {
      setNote("We couldn’t save that change. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function decide(profileId: string, accept: boolean) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/crossings/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          action: "decide",
          profileId,
          accept,
        }),
      });
      if (!res.ok) throw new Error("request");
      router.refresh();
    } catch {
      setNote("We couldn’t save that change. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-3">
      {note ? (
        <p role="status" className="text-sm text-gold">
          {note}
        </p>
      ) : null}
      {canMutate && !mine && table.joinMode === "request" ? (
        <Button disabled={busy} onClick={() => void join()}>
          Request to join
        </Button>
      ) : null}
      {mine ? (
        <p className="text-sm text-ivory-muted">Your seat: {mine.status}</p>
      ) : null}
      {isHost
        ? table.guests
            .filter((g) => g.status === "requested")
            .map((g) => (
              <div key={g.profileId} className="flex flex-wrap gap-2">
                <Button
                  disabled={busy}
                  onClick={() => void decide(g.profileId, true)}
                >
                  Confirm {names[g.profileId] ?? "member"}
                </Button>
                <Button
                  disabled={busy}
                  variant="ghost"
                  onClick={() => void decide(g.profileId, false)}
                >
                  Decline
                </Button>
              </div>
            ))
        : null}
    </div>
  );
}
