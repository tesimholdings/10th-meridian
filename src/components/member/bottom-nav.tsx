"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memberNav } from "@/lib/config/site";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[rgba(8,9,11,0.86)] backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {memberNav.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] tracking-[0.16em] uppercase ${
                  active ? "text-ivory" : "text-ivory-dim"
                }`}
              >
                {active ? (
                  <span className="absolute top-0 h-px w-6 bg-[var(--gold)]" aria-hidden />
                ) : null}
                <NavIcon id={item.id} active={Boolean(active)} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? "#c6a45a" : "#9c978c";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      {id === "home" ? (
        <path d="M3 9 L9 3 L15 9 V15 H3 Z" fill="none" stroke={stroke} />
      ) : null}
      {id === "index" ? (
        <>
          <circle cx="9" cy="9" r="6" fill="none" stroke={stroke} />
          <path d="M9 3 V15 M3 9 H15" stroke={stroke} />
        </>
      ) : null}
      {id === "channels" ? (
        <path d="M3 5 H15 M3 9 H15 M3 13 H10" fill="none" stroke={stroke} />
      ) : null}
      {id === "members" ? (
        <>
          <circle cx="7" cy="7" r="2.2" fill="none" stroke={stroke} />
          <circle cx="12" cy="8" r="1.8" fill="none" stroke={stroke} />
          <path d="M3.5 14 C4 11.5 10 11.5 10.5 14" fill="none" stroke={stroke} />
        </>
      ) : null}
      {id === "profile" ? (
        <circle cx="9" cy="9" r="6.5" fill="none" stroke={stroke} />
      ) : null}
    </svg>
  );
}
