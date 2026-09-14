"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/logo";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/matching", label: "Matching" },
  { href: "/admin/crossings", label: "Crossings" },
  { href: "/admin/open-house", label: "Open House" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/billing", label: "Billing" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-void text-ivory">
      <header className="safe-pad safe-top sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[rgba(7,8,9,0.82)] py-3 backdrop-blur-md">
        <Wordmark compact />
        <Link href="/member/home" className="text-[11px] tracking-[0.18em] uppercase text-ivory-muted">
          House
        </Link>
      </header>
      <div className="safe-pad mx-auto grid max-w-6xl gap-8 py-8 md:grid-cols-[200px_1fr]">
        <nav className="-mx-1 flex gap-1 overflow-x-auto hide-scroll pb-2 md:mx-0 md:grid md:content-start md:gap-1 md:overflow-visible md:pb-0">
          <p className="label mb-3 hidden md:block">Steward desk</p>
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex min-h-11 shrink-0 items-center px-3 text-sm md:px-0 ${
                  active ? "text-ivory" : "text-ivory-dim"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0">
          <p className="label">{title}</p>
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
