import { env } from "@/lib/env";
import type { AccessContext } from "@/lib/access/context";

export function PreviewTools({ access }: { access: AccessContext }) {
  if (!env.previewTools) return null;

  return (
    <details className="fixed right-3 top-3 z-50 max-w-[16rem] border border-[var(--line)] bg-void/90 p-3 text-[11px] text-ivory-muted backdrop-blur">
      <summary className="cursor-pointer tracking-[0.18em] uppercase text-gold">
        Reviewer tools
      </summary>
      <p className="mt-2 leading-relaxed">
        Preview only. Hidden when <code>VERCEL_ENV=production</code>.
      </p>
      <p className="mt-2">
        Phase: {access.decision.phase} · Role: {access.user?.role ?? "guest"}
      </p>
      <form action="/api/preview/session" method="post" className="mt-3 grid gap-2">
        <button name="role" value="guest" className="min-h-10 border border-[var(--line)] px-2">
          Guest / lock
        </button>
        <button name="role" value="member" className="min-h-10 border border-[var(--line)] px-2">
          Preview as member
        </button>
        <button name="role" value="approved_unpaid" className="min-h-10 border border-[var(--line)] px-2">
          Approved — payment pending
        </button>
        <button name="role" value="administrator" className="min-h-10 border border-[var(--line)] px-2">
          Preview as admin
        </button>
        <button name="openHouse" value="open" className="min-h-10 border border-[var(--line)] px-2">
          Force Open House cookie
        </button>
        <button name="openHouse" value="clear" className="min-h-10 border border-[var(--line)] px-2">
          Clear force cookie
        </button>
      </form>
    </details>
  );
}
