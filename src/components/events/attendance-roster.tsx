"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Face } from "@/lib/events/attendance";

export function AttendanceRoster({
  going,
  waitlist,
  canPromote = false,
  eventId,
  tableId,
}: {
  going: Face[];
  waitlist: Face[];
  canPromote?: boolean;
  eventId?: string;
  tableId?: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function promote(person: Face) {
    setPendingId(person.id);
    setNote(null);
    const res = eventId
      ? await fetch("/api/events/promote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, accountId: person.accountId }),
        })
      : await fetch("/api/crossings/tables", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableId, action: "decide", profileId: person.id, accept: true, force: true }),
        });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    setPendingId(null);
    setNote(json?.message ?? (json?.ok ? `${person.name} is attending.` : "Could not promote."));
    router.refresh();
  }

  async function decline(person: Face) {
    if (!tableId) return;
    setPendingId(person.id);
    await fetch("/api/crossings/tables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId, action: "decide", profileId: person.id, accept: false }),
    });
    setPendingId(null);
    setNote(`${person.name} declined.`);
    router.refresh();
  }

  return (
    <div className="attendance">
      <section>
        <h2 className="attendance-kicker">Going</h2>
        {going.length === 0 ? <p className="face-empty face-empty-navy">No one yet</p> : (
          <ul className="attendance-list">
            {going.map((person) => (
              <li key={person.id}>
                <span className="avatar face-avatar" style={{ background: person.accent }}>
                  {person.initials}
                </span>
                <span>{person.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="attendance-kicker">Waitlist</h2>
        {waitlist.length === 0 ? <p className="face-empty face-empty-navy">Waitlist empty</p> : (
          <ul className="attendance-list">
            {waitlist.map((person) => (
              <li key={person.id}>
                <span className="avatar face-avatar" style={{ background: person.accent }}>
                  {person.initials}
                </span>
                <span className="min-w-0 flex-1">
                  {person.name}
                  {person.position ? <span className="attendance-pos"> · {person.position}</span> : null}
                </span>
                {canPromote ? (
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="action-quiet"
                      disabled={pendingId === person.id}
                      onClick={() => void promote(person)}
                    >
                      Promote
                    </button>
                    {tableId ? (
                      <button
                        type="button"
                        className="action-quiet"
                        disabled={pendingId === person.id}
                        onClick={() => void decline(person)}
                      >
                        Decline
                      </button>
                    ) : null}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      {note ? <p className="action-ack mt-4 text-sm text-[var(--gold-dim)]">{note}</p> : null}
    </div>
  );
}
