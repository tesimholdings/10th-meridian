import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { demoEvents } from "@/lib/data/demo";

export const metadata = { title: "Events", robots: { index: false } };

export default async function EventsPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Experiences">
      <p className="text-sm text-ivory-muted">
        Curated dinners, salons, retreats, and member-hosted evenings. Listings
        below are DEMO concepts — never presented as completed real-world events.
      </p>
      <ul className="mt-8 grid gap-4">
        {demoEvents.map((e) => (
          <li key={e.id} className="border border-[var(--line)] p-5">
            <p className="label">{e.kind}</p>
            <h2 className="mt-2 font-serif text-3xl">{e.title}</h2>
            <p className="mt-2 text-sm text-ivory-muted">{e.summary}</p>
            <p className="mt-4 text-[11px] tracking-[0.16em] uppercase text-gold">
              Capacity {e.capacity} · {e.city}
              {e.paymentRequired ? " · optional Stripe event payment" : ""}
            </p>
          </li>
        ))}
      </ul>
    </MemberShell>
  );
}
