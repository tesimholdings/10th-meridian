import Link from "next/link";
import { MotionControl } from "@/components/ui/motion-system";
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
    <div className="member-shell min-h-dvh text-ivory">
      <a href="#member-content" className="skip-link">
        Skip to content
      </a>
      <header className="member-header safe-pad sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[rgba(7,8,9,0.88)] py-3 backdrop-blur">
        <Wordmark compact />
        <div className="flex items-center gap-4">
          <MotionControl />
          <details className="relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center tracking-[0.18em] uppercase text-[11px] text-gold">
              Menu
            </summary>
            <div className="floating-menu absolute right-0 mt-2 w-56 border border-[var(--line)] bg-ink p-3">
              {memberSecondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center text-sm text-ivory-muted"
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "administrator" || user?.role === "moderator" ? (
                <Link
                  href="/admin"
                  className="flex min-h-11 items-center text-sm text-gold"
                >
                  Steward desk
                </Link>
              ) : null}
              <form action="/api/auth/sign-out" method="post">
                <button className="flex min-h-11 w-full items-center text-left text-sm text-ivory-muted">
                  Sign Out
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>
      {demo ? (
        <details className="demo-notice safe-pad border-b border-[var(--gold-soft)] bg-[rgba(176,141,74,0.06)] text-[11px] text-gold">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2">
            Preview · Synthetic member data <span aria-hidden="true">+</span>
          </summary>
          <p className="pb-3 leading-relaxed">{DEMO_DISCLAIMER}</p>
        </details>
      ) : null}

      <main
        id="member-content"
        className="member-main safe-pad safe-bottom mx-auto max-w-6xl py-8"
      >
        <p className="label">{title}</p>
        <div className="mt-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
