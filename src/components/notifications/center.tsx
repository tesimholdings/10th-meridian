"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HouseNotification } from "@/lib/network/types";

export function NotificationCenter({ notifications }: { notifications: HouseNotification[] }) {
  const router = useRouter();

  async function markRead(ids?: string[]) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", ids }),
    });
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <p className="mt-6 text-sm leading-relaxed text-ivory-dim">
        The house is quiet. Notifications stay low-volume — new people in a channel, Circle or Index
        additions, introductions, events, and announcements.
      </p>
    );
  }

  return (
    <div>
      <button type="button" className="action-quiet" onClick={() => void markRead()}>
        Mark all read
      </button>
      <ul className="mt-6 grid gap-3">
        {notifications.map((n) => (
          <li key={n.id} className={`panel p-4 ${n.read ? "opacity-70" : ""}`}>
            <p className="label">{n.kind.replaceAll("_", " ")}</p>
            <p className="mt-2 font-serif text-2xl">{n.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{n.body}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {n.href ? (
                <Link href={n.href} className="text-[11px] tracking-[0.16em] uppercase text-gold">
                  Open
                </Link>
              ) : null}
              {n.read ? null : (
                <button
                  type="button"
                  className="text-[11px] tracking-[0.16em] uppercase text-ivory-dim"
                  onClick={() => void markRead([n.id])}
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
