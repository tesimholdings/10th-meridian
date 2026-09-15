"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memberNav } from "@/lib/config/site";
import { NavIcon } from "@/components/member/nav-icons";
import { Wordmark } from "@/components/brand/logo";

export function DesktopRail({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-[rgba(196,162,100,0.28)] px-4 py-5 md:flex">
      <Wordmark compact surface="light" />
      <nav className="mt-8 grid gap-1" aria-label="Primary">
        {memberNav.map((item) => {
          const active =
            item.id === "home"
              ? pathname === item.href
              : Boolean(pathname?.startsWith(item.href));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`pressable flex min-h-11 items-center gap-3 rounded-full px-3 text-sm ${
                active ? "rail-active text-[var(--navy)]" : "text-[var(--ivory-dim)]"
              }`}
            >
              <span className="relative">
                <NavIcon id={item.id} active={Boolean(active)} />
                {item.id === "messages" && unreadMessages > 0 ? (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--blue)]" />
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
