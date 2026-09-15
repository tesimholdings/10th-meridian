"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memberNav } from "@/lib/config/site";
import { NavIcon } from "@/components/member/nav-icons";

export function BottomNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="nav-chrome fixed inset-x-0 bottom-0 z-40 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {memberNav.map((item) => {
          const active =
            item.id === "home"
              ? pathname === item.href
              : Boolean(pathname?.startsWith(item.href));
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`pressable relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] ${
                  active ? "text-[#faf8f2] font-medium" : "text-[#efe6d4]/55"
                }`}
              >
                {active ? (
                  <span className="absolute top-0 h-0.5 w-6 rounded-full bg-[var(--gold)]" aria-hidden />
                ) : null}
                <span className="relative">
                  <NavIcon id={item.id} active={Boolean(active)} />
                  {item.id === "messages" && unreadMessages > 0 ? (
                    <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-[var(--gold)] px-1 text-center text-[9px] text-[#092b45]">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
