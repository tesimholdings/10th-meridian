import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { demoProfiles } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Members", robots: { index: false } };

export default async function MembersPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Directory">
      <p className="text-sm text-ivory-muted">
        Private, not indexed. Filters are local in this foundation. No real
        photographs.
      </p>
      <ul className="mt-8 grid gap-4">
        {demoProfiles.map((p) => (
          <li key={p.id} className="grid grid-cols-[auto_1fr] gap-4 border border-[var(--line)] p-4">
            <div
              className="flex h-16 w-16 items-center justify-center font-serif text-xl"
              style={{ background: p.accent }}
            >
              {p.initials}
            </div>
            <div>
              <p className="font-serif text-2xl">{p.displayName}</p>
              <p className="text-sm text-ivory-muted">
                {p.headline} · {p.city}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-gold">
                SYNTHETIC DEMO
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button href="/member/channels" variant="ghost" className="!min-h-11 !px-3">
                  Message
                </Button>
                <Button href="/member/matches" variant="ghost" className="!min-h-11 !px-3">
                  Request introduction
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </MemberShell>
  );
}
