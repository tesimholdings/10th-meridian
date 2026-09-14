import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MatchBoard } from "@/components/matches/match-board";
import { demoIndexFor } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";
import { getPreviewStore, unreadTotal, viewerProfile } from "@/lib/preview/store";
import { completionMessage } from "@/lib/profile/completion";

export const metadata = { title: "Home", robots: { index: false } };

export default async function MemberHomePage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const index = await demoIndexFor(viewer);
  const paymentPending = access.user?.role === "approved_unpaid";

  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess || viewer.isDemo} title="Good evening">
      <h1 className="font-serif text-4xl md:text-5xl">
        {viewer.displayName}, the house is still.
      </h1>
      <p className="mt-3 max-w-xl text-ivory-muted">{brand.matchingLine}</p>

      {paymentPending ? (
        <Link href="/member/billing" className="mt-6 block panel p-5" style={{ borderColor: "var(--gold-dim)" }}>
          <p className="label">Membership</p>
          <p className="mt-2 font-serif text-2xl">Approved — payment pending</p>
          <p className="mt-2 text-sm text-ivory-muted">
            Complete Stripe-hosted checkout to enter fully. Lifetime is $10,000, one time.
          </p>
        </Link>
      ) : null}

      <section className="mt-10 grid gap-3 md:grid-cols-3">
        <Stat label="Unread / mentions" value={`${unreadTotal()} · DEMO`} href="/member/channels" />
        <Stat label="Profile completion" value={`${viewer.completion}%`} href="/onboarding" />
        <Stat
          label="Membership"
          value={paymentPending ? "Payment pending" : "Active · renewal unset"}
          href="/member/billing"
        />
      </section>
      <p className="mt-3 text-sm text-ivory-dim">{completionMessage(viewer.completion)}</p>

      <section className="mt-10">
        <Link href="/member/crossings" className="block overflow-hidden border border-[var(--line)] water p-6">
          <p className="label">Crossings</p>
          <p className="mt-3 font-serif text-3xl leading-tight">{brand.crossingsLine}</p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ivory-muted">{brand.crossingsSupport}</p>
          <p className="mt-5 text-[11px] tracking-[0.16em] uppercase text-gold">
            Enter · city-level only · SYNTHETIC DEMO
          </p>
        </Link>
      </section>

      <section className="mt-12">
        <p className="label">Announcements</p>
        {store.announcements.map((a) => (
          <article key={a.id} className="panel mt-3 p-5">
            <h2 className="font-serif text-2xl">{a.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{a.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <MatchBoard index={index} intros={store.intros} compact />
        <Link href="/member/index" className="mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.18em] uppercase text-gold">
          Open the full Index
        </Link>
      </section>

      <section className="mt-12">
        <p className="label">Upcoming experiences</p>
        <ul className="mt-4 grid gap-3">
          {store.events.map((e) => (
            <li key={e.id} className="border-b border-[var(--line)] py-3">
              <Link href={`/member/events/${e.id}`}>
                <p className="font-serif text-xl">{e.title}</p>
                <p className="text-sm text-ivory-muted">{e.summary}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gold">{e.listingState}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <p className="label">Introduction requests</p>
        {store.intros.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
            No introductions yet. Relevance first — then a request, if the moment is right.
          </p>
        ) : (
          store.intros.map((i) => (
            <p key={i.id} className="mt-2 text-sm text-ivory-muted">
              {i.fromName} → {i.toName} · {i.status} · DEMO
            </p>
          ))
        )}
      </section>
    </MemberShell>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="panel-quiet p-4">
      <p className="label">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </Link>
  );
}
