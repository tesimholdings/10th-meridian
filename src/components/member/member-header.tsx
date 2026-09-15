"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [sheet, setSheet] = useState(false);
  const moreRef = useRef<HTMLDetailsElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const sheetInput = useRef<HTMLInputElement>(null);
  const sheetTitle = useId();
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (sheet) {
        setSheet(false);
        return;
      }
      const el = moreRef.current;
      if (!el?.open) return;
      el.open = false;
      el.querySelector("summary")?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetInput.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      searchBtn.current?.focus();
    };
  }, [sheet]);

  function go(query: string) {
    const needle = query.trim();
    setSheet(false);
    router.push(`/member/circle?tab=all&q=${encodeURIComponent(needle)}`);
  }

  return (
    <header className="header-chrome safe-pad safe-top sticky top-0 z-30 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-x-3 gap-y-2">
        <div className="md:hidden">
          <Wordmark compact surface="dark" />
        </div>
        <form
          className="hidden min-w-0 flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            go(q);
          }}
        >
          <label className="sr-only" htmlFor="house-search">
            Search people and cities
          </label>
          <input
            id="house-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people and cities"
            className="min-h-11 min-w-0 w-full rounded-full"
          />
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            ref={searchBtn}
            type="button"
            className="pressable flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            aria-label="Search people and cities"
            onClick={() => setSheet(true)}
          >
            <SearchIcon />
          </button>
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
      </div>

      {sheet && portalReady
        ? createPortal(
            <div className="fixed inset-0 z-[80] md:hidden" role="presentation">
              <button
                type="button"
                className="absolute inset-0 bg-black/70"
                aria-label="Close search"
                onClick={() => setSheet(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={sheetTitle}
                className="header-chrome absolute inset-x-0 top-0 px-4 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p id={sheetTitle} className="font-serif text-xl text-[#efe6d4]">
                    Search
                  </p>
                  <button type="button" className="min-h-11 px-2 text-sm text-[#efe6d4]" onClick={() => setSheet(false)}>
                    Close
                  </button>
                </div>
                <form
                  className="mt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    go(q);
                  }}
                >
                  <label className="sr-only" htmlFor="house-search-sheet">
                    Search people and cities
                  </label>
                  <input
                    ref={sheetInput}
                    id="house-search-sheet"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search people and cities"
                    className="min-h-12 w-full rounded-full"
                  />
                  <button type="submit" className="action-quiet mt-3 w-full">
                    Show results
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.4 12.4 L16.2 16.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
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
