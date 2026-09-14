import Link from "next/link";
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
  return (
    <div className="min-h-dvh bg-void text-ivory">
      <header className="safe-pad flex items-center justify-between border-b border-[var(--line)] py-4">
        <Wordmark compact />
        <Link href="/member/home" className="text-[11px] tracking-[0.18em] uppercase text-gold">
          House
        </Link>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_1fr]">
        <nav className="grid content-start gap-1">
          <p className="label mb-3">Steward desk</p>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-sm text-ivory-muted">
              {l.label}
            </Link>
          ))}
        </nav>
        <main>
          <p className="label">{title}</p>
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
