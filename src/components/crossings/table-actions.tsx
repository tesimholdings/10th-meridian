"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GroupTableRecord } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";

export function TableActions({
  table,
  viewerId,
  canMutate,
}: {
  table: GroupTableRecord;
  viewerId: string;
  canMutate: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const isHost = table.openedByProfileId === viewerId;
  const mine = table.guests.find((g) => g.profileId === viewerId);

  async function join() {
    const res = await fetch("/api/crossings/tables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: table.id, action: "join" }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setNote(json.ok ? "Requested a seat." : json.message ?? "Could not join.");
    router.refresh();
  }

  async function decide(profileId: string, accept: boolean) {
    await fetch("/api/crossings/tables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: table.id, action: "decide", profileId, accept }),
    });
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-3">
      {note ? <p className="text-sm text-gold">{note}</p> : null}
      {canMutate && !mine && table.joinMode === "request" ? (
        <Button onClick={() => void join()}>Request to join</Button>
      ) : null}
      {mine ? (
        <p className="text-sm text-ivory-muted">Your seat: {mine.status}</p>
      ) : null}
      {isHost
        ? table.guests
            .filter((g) => g.status === "requested")
            .map((g) => (
              <div key={g.profileId} className="flex flex-wrap gap-2">
                <Button onClick={() => void decide(g.profileId, true)}>Confirm {g.profileId}</Button>
                <Button variant="ghost" onClick={() => void decide(g.profileId, false)}>
                  Decline
                </Button>
              </div>
            ))
        : null}
    </div>
  );
}
