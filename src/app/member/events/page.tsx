import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Events", robots: { index: false } };

export default async function EventsPage() {
  const access = await resolveAccessContext();
  const events = getPreviewStore().events;
  return (
    <MemberShell user={access.user} demo title="Experiences">
      <h1 className="font-serif">
        Be part of
        <br />
        <em className="text-gold">something memorable.</em>
      </h1>
      <p className="mt-5 text-sm text-ivory-muted">
        Curated dinners, salons, retreats, and member-hosted evenings. Every
        listing below is a DEMO concept or a planned date — never a completed
        real-world event.
      </p>
      <ul className="mt-8 grid gap-4">
        {events.map((e, i) => (
          <li key={e.id}>
            <Link
              href={`/member/events/${e.id}`}
              className={
                i === 0
                  ? "experience-feature relative block min-h-[42vh] overflow-hidden p-6 md:p-10"
                  : "editorial-row block"
              }
            >
              <p className="label">
                {e.kind} · {e.listingState}
              </p>
              <h2
                className={
                  i === 0
                    ? "mt-4 font-serif text-4xl leading-tight md:text-5xl"
                    : "mt-2 font-serif text-3xl"
                }
              >
                {e.title}
              </h2>
              <p
                className={
                  i === 0
                    ? "mt-4 max-w-lg text-ivory-muted"
                    : "mt-2 text-sm text-ivory-muted"
                }
              >
                {e.summary}
              </p>
              <p className="mt-4 text-[11px] tracking-[0.16em] uppercase text-gold">
                Capacity {e.capacity} · {e.registered} listed · {e.waitlist}{" "}
                waitlist · {e.city}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </MemberShell>
  );
}
