"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HouseNotification } from "@/lib/network/types";
import { formatRelativeTime } from "@/lib/crossings/format";

function circleCopy(n: HouseNotification): string {
  if (n.kind === "circle_add") {
    const name = n.actorName ?? n.title.replace(/ added you to Your Circle$/i, "");
    return `${name} added you to their Circle`;
  }
  return n.title;
}

export function NotificationCenter({ notifications }: { notifications: HouseNotification[] }) {
  const router = useRouter();
  const sorted = [...notifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  async function markRead(ids?: string[]) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", ids }),
    });
    router.refresh();
  }

  if (sorted.length === 0) {
    return <p className="mt-6 text-sm text-[var(--ivory-dim)]">Nothing new.</p>;
  }

  return (
    <div>
      <button type="button" className="action-quiet" onClick={() => void markRead()}>
        Mark all read
      </button>
      <ul className="mt-4 divide-y divide-[var(--line)]">
        {sorted.map((n) => {
          const row = (
            <span className="flex w-full items-start gap-3 py-3">
              <span className="avatar h-10 w-10 text-xs" style={{ background: n.read ? "#1a4663" : "#087CB8" }}>
                {n.actorInitials ?? n.kind.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{circleCopy(n)}</span>
                <span className="block text-sm text-[var(--ivory-dim)]">{n.body}</span>
              </span>
              <span className="flex flex-col items-end gap-2">
                <span className="text-xs text-[var(--ivory-dim)]">{formatRelativeTime(n.createdAt)}</span>
                {n.read ? null : <span className="unread-dot" />}
              </span>
            </span>
          );
          return (
            <li key={n.id}>
              {n.href ? (
                <Link href={n.href} className="block" onClick={() => void markRead([n.id])}>
                  {row}
                </Link>
              ) : (
                <button type="button" className="w-full text-left" onClick={() => void markRead([n.id])}>
                  {row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
