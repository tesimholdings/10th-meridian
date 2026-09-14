import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { BottomNav } from "@/components/member/bottom-nav";
import { DEMO_DISCLAIMER } from "@/lib/data/demo";
import { memberSecondary } from "@/lib/config/site";
import type { SessionUser } from "@/lib/access/session";

export function MemberShell({
  user,
  demo,
  title,
  children,
}: {
  user: SessionUser | null;
  demo: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-void text-ivory">
      <header className="safe-pad safe-top sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[rgba(7,8,9,0.78)] py-2.5 backdrop-blur-md">
        <Wordmark compact />
        <details className="relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center tracking-[0.18em] uppercase text-[11px] text-ivory-muted">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-56 border border-[var(--line)] bg-ink/95 p-2 backdrop-blur">
            {memberSecondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center px-2 text-sm text-ivory-muted"
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "administrator" || user?.role === "moderator" ? (
              <Link href="/admin" className="flex min-h-11 items-center px-2 text-sm text-gold">
                Steward desk
              </Link>
            ) : null}
            <form action="/api/auth/sign-out" method="post">
              <button className="flex min-h-11 w-full items-center px-2 text-left text-sm text-ivory-muted">
                Sign Out
              </button>
            </form>
          </div>
        </details>
      </header>
      {demo ? (
        <p className="safe-pad border-b border-[var(--line)] py-2 text-[10px] leading-relaxed tracking-[0.04em] text-ivory-dim">
          {DEMO_DISCLAIMER}
        </p>
      ) : null}
      <main className="safe-pad safe-bottom mx-auto max-w-5xl py-8">
        <p className="label">{title}</p>
        <div className="mt-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
