"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import { memberSecondary } from "@/lib/config/site";
import type { SessionUser } from "@/lib/access/session";

export function MemberHeader({
  user,
  unreadNotifications = 0,
}: {
  user: SessionUser | null;
  unreadNotifications?: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const moreRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const el = moreRef.current;
      if (!el?.open) return;
      el.open = false;
      el.querySelector("summary")?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="header-chrome safe-pad safe-top sticky top-0 z-30 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:flex-nowrap">
        <div className="md:hidden">
          <Wordmark compact surface="dark" />
        </div>
        <div className="ml-auto flex items-center gap-2 md:order-last md:ml-0">
          <Link
            href="/member/notifications"
            className="pressable relative flex h-11 w-11 items-center justify-center rounded-full"
            aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
          >
            <BellIcon />
            {unreadNotifications > 0 ? (
              <span className="unread-dot absolute right-2 top-2" />
            ) : null}
          </Link>
          <details ref={moreRef} className="relative">
            <summary className="flex h-11 cursor-pointer list-none items-center px-2 text-sm text-[#efe6d4]">
              More
            </summary>
            <div className="glass-menu absolute right-0 mt-2 w-56 rounded-2xl p-2">
              {memberSecondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center px-3 text-sm text-[var(--navy)]"
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "administrator" || user?.role === "moderator" ? (
                <Link href="/admin" className="flex min-h-11 items-center px-3 text-sm text-[var(--gold)]">
                  Steward desk
                </Link>
              ) : null}
              <form action="/api/auth/sign-out" method="post">
                <button className="flex min-h-11 w-full items-center px-3 text-left text-sm text-[var(--ivory-dim)]">
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </div>
        <form
          className="min-w-0 w-full flex-1 basis-full md:basis-auto"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/member/circle?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <label className="sr-only" htmlFor="house-search">
            Search
          </label>
          <input
            id="house-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people and cities"
            className="min-h-11 min-w-0 w-full rounded-full"
          />
        </form>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        d="M10 3.2 C7.2 3.2 5.4 5.2 5.4 8 v3.1 L4 13.8 h12 L14.6 11.1 V8 C14.6 5.2 12.8 3.2 10 3.2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M8.4 15.4 C8.8 16.4 11.2 16.4 11.6 15.4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
