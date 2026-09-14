import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { HeroStage } from "@/components/cinematic/hero-stage";
import { Button } from "@/components/ui/button";
import { demoEvents, demoProfiles, DEMO_DISCLAIMER } from "@/lib/data/demo";
import { brand } from "@/lib/config/site";
import { membershipProducts } from "@/lib/config/pricing";
import type { AccessContext } from "@/lib/access/context";

export function OpenHouseLanding({ access }: { access: AccessContext }) {
  return (
    <div className="bg-void text-ivory">
      <HeroStage caption="REPLACE ASSET — Open House hero film. Do not use unlicensed footage.">
        <div className="safe-pad mx-auto flex min-h-dvh max-w-6xl flex-col justify-between py-10">
          <Wordmark />
          <div className="max-w-2xl pb-16">
            <p className="label">Open House · DEMO</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] md:text-7xl">
              {brand.idea}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ivory-muted">
              {brand.positioning}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/apply">Begin application</Button>
              <Button href="/demo/home" variant="ghost">
                Walk the DEMO house
              </Button>
            </div>
            <p className="mt-6 text-sm text-gold">{brand.scarcity}</p>
            {access.referralValid ? (
              <p className="mt-3 text-sm text-ivory-muted">{brand.referralTone}</p>
            ) : null}
          </div>
        </div>
      </HeroStage>

      <section className="safe-pad mx-auto max-w-6xl py-20">
        <p className="text-[12px] leading-relaxed text-gold">{DEMO_DISCLAIMER}</p>
        <div className="mt-10 grid gap-12 md:grid-cols-2">
          <div>
            <p className="label">Not this</p>
            <ul className="mt-4 space-y-2 text-ivory-muted">
              <li>Not a lead database.</li>
              <li>Not a traditional social network.</li>
              <li>Not a public directory.</li>
            </ul>
          </div>
          <div>
            <p className="label">This</p>
            <p className="mt-4 font-serif text-3xl leading-snug">
              A highly selective private network for accomplished founders,
              investors, executives, operators, advisors, creators, athletes,
              explorers, and cultural leaders.
            </p>
          </div>
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl border-t border-[var(--line)] py-20">
        <p className="label">Membership</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {Object.values(membershipProducts).map((p) => (
            <article key={p.id} className="border border-[var(--line)] p-6">
              <h3 className="font-serif text-3xl">{p.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{p.summary}</p>
              <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-gold">
                {p.priceLabel}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-ivory-dim">
          Prices are not published until approved. Checkout is Stripe-hosted after
          a human approval — never on this page as a public buy button.
        </p>
      </section>

      <section className="safe-pad mx-auto max-w-6xl border-t border-[var(--line)] py-20">
        <p className="label">SYNTHETIC DEMO members</p>
        <p className="mt-2 font-serif text-3xl">Initials, not faces.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {demoProfiles.slice(0, 8).map((p) => (
            <div key={p.id} className="border border-[var(--line)] p-4">
              <div
                className="flex h-16 w-16 items-center justify-center font-serif text-xl"
                style={{ background: p.accent }}
              >
                {p.initials}
              </div>
              <p className="mt-3 font-serif text-xl">{p.displayName}</p>
              <p className="text-sm text-ivory-muted">{p.roleTitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl border-t border-[var(--line)] py-20">
        <p className="label">Planned experiences</p>
        <p className="mt-2 text-sm text-ivory-dim">
          DEMO listings. None of these are completed real-world events.
        </p>
        <ul className="mt-8 grid gap-4">
          {demoEvents.map((e) => (
            <li key={e.id} className="border border-[var(--line)] p-5">
              <p className="font-serif text-2xl">{e.title}</p>
              <p className="mt-2 text-sm text-ivory-muted">{e.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="safe-pad mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-[var(--line)] py-10 text-[11px] tracking-[0.16em] uppercase text-ivory-dim">
        <p>{brand.name}</p>
        <div className="flex gap-4">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/sign-in">Member Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
