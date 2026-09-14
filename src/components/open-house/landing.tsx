import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { MeridianMark } from "@/components/brand/mark";
import { DemoMark } from "@/components/brand/demo-mark";
import { HeroStage } from "@/components/cinematic/hero-stage";
import { Button } from "@/components/ui/button";
import { DEMO_DISCLAIMER } from "@/lib/data/demo";
import { brand } from "@/lib/config/site";
import { customerFacingProducts } from "@/lib/config/pricing";
import type { AccessContext } from "@/lib/access/context";
import { acceptedThisCohort, getPreviewStore } from "@/lib/preview/store";
import { COMMUNITY_STANDARD, LIFETIME_PRICE_LABEL, SOLICITING_BAN } from "@/lib/copy/community";
import { ASK_THE_MERIDIAN, MERIDIAN_10, MERIDIAN_100, MERIDIAN_INDEX, WHO_CAN_HELP } from "@/lib/copy/ui";
import { presentProfile } from "@/lib/network/privacy";

export function OpenHouseLanding({ access }: { access: AccessContext }) {
  const store = getPreviewStore();
  const remaining = Math.max(0, store.admissionsCap - acceptedThisCohort());
  const walkthrough = store.profiles.slice(0, 6).map((p) =>
    presentProfile(p, { viewerId: "open-house-guest", isOpenHouseGuest: true }),
  );

  return (
    <div className="bg-void text-ivory">
      <HeroStage caption="REPLACE ASSET — Open House hero film. Do not use unlicensed footage.">
        <div className="safe-pad safe-top mx-auto flex min-h-dvh max-w-6xl flex-col justify-between py-8 md:py-10">
          <Wordmark />
          <div className="rise max-w-2xl pb-24">
            <p className="label">Open House · the tenth</p>
            <DemoMark className="mt-2 block">DEMO · walkthrough only · no real private data</DemoMark>
            <h1 className="oh-title mt-5 font-serif text-[2.85rem] leading-[0.92] md:text-7xl">
              {brand.idea}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ivory-muted md:text-lg">
              {brand.positioning}
            </p>
            <div className="mt-8 hidden gap-3 sm:flex-row md:flex">
              <Button href="/apply">Begin application</Button>
              <Button href="/member/home" variant="ghost">
                Walk the DEMO house
              </Button>
            </div>
            <p className="mt-8 text-[11px] leading-relaxed tracking-[0.06em] text-ivory-dim">
              {brand.scarcity} Lifetime membership {LIFETIME_PRICE_LABEL}.
            </p>
            <p className="mt-3 text-sm text-ivory-muted">{brand.referralTone}</p>
            <p className="mt-3 text-sm text-gold">{SOLICITING_BAN}</p>
            {access.referralValid ? (
              <p className="mt-3 text-[11px] tracking-[0.16em] uppercase text-gold">
                Referred applicant · early door honored
              </p>
            ) : null}
          </div>
        </div>
      </HeroStage>

      <div
        className="safe-pad sticky bottom-0 z-30 border-t border-[var(--line)] bg-[rgba(7,8,9,0.92)] py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button href="/apply" className="!min-h-11">Apply</Button>
          <Button href="/member/home" variant="ghost" className="!min-h-11">DEMO house</Button>
        </div>
      </div>

      <section className="safe-pad mx-auto max-w-6xl py-20 md:py-28">
        <p className="max-w-2xl text-[12px] leading-relaxed text-ivory-dim">{DEMO_DISCLAIMER}</p>
        <p className="label mt-14">Philosophy</p>
        <div className="mt-5 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <h2 className="rise font-serif text-4xl leading-[1.05] md:text-5xl">
            Relevance. Trust. Contribution. The right relationship can change everything.
          </h2>
          <p className="rise-delay text-ivory-muted leading-relaxed">
            10th Meridian is not a marketplace of names. It is a small house that
            opens once a month so the next conversation can be the one that matters.
            Intelligence can find a signal. People still decide what happens next.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] water">
        <div className="grain opacity-30" />
        <div className="oh-aurora breath" aria-hidden />
        <div className="safe-pad relative mx-auto flex max-w-6xl flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between md:py-28">
          <MeridianMark className="h-24 w-24 breath md:h-32 md:w-32" />
          <blockquote className="max-w-xl font-serif text-3xl leading-snug md:text-4xl">
            {brand.matchingLine}
          </blockquote>
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <p className="label">Not this</p>
            <ul className="mt-5 space-y-3 text-ivory-muted">
              <li>Not a lead database.</li>
              <li>Not a traditional social network.</li>
              <li>Not a public directory.</li>
              <li>Not a place to solicit. {SOLICITING_BAN}</li>
            </ul>
          </div>
          <div>
            <p className="label">Who belongs</p>
            <p className="mt-5 font-serif text-3xl leading-snug">
              Accomplished founders, investors, executives, operators, advisors,
              creators, athletes, explorers, and cultural leaders.
            </p>
            <p className="mt-4 text-sm text-ivory-dim">
              Selection is human and discretionary. A complete application is
              considered. Nothing here is a guarantee.
            </p>
          </div>
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl border-t border-[var(--line)] py-20 md:py-28">
        <p className="label">{MERIDIAN_INDEX}</p>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl md:text-5xl">{brand.matchingLine}</h2>
        <p className="mt-4 max-w-xl text-sm text-ivory-muted">{brand.circleLine}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="panel oh-card p-6 md:p-8">
            <p className="label">{MERIDIAN_10}</p>
            <p className="mt-4 font-serif text-3xl leading-snug">{brand.meridian10}</p>
            <p className="mt-5 text-sm leading-relaxed text-ivory-muted">
              Structured complementarity, goals, interests, industry, geography,
              availability, and novelty — then a steward may promote or suppress
              with a written reason.
            </p>
          </article>
          <article className="panel oh-card p-6 md:p-8">
            <p className="label">{MERIDIAN_100}</p>
            <p className="mt-4 font-serif text-3xl leading-snug">{brand.meridian100}</p>
            <p className="mt-5 text-sm leading-relaxed text-ivory-muted">
              Up to one hundred ranked connections, or every eligible member if
              fewer. Profiles are never invented.
            </p>
          </article>
        </div>
        <Button href="/member/index" variant="ghost" className="mt-8">
          See the DEMO Index
        </Button>
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] bg-[rgba(12,28,40,0.28)] py-20 md:py-28">
        <div className="oh-aurora breath" aria-hidden />
        <div className="safe-pad relative mx-auto max-w-6xl">
          <p className="label">{ASK_THE_MERIDIAN}</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl md:text-5xl">{WHO_CAN_HELP}</h2>
          <p className="mt-4 max-w-xl text-ivory-muted leading-relaxed">
            {brand.askLine} Ask in the language you would use at a table — not a
            search box for a directory. The house finds signal. It does not invent people.
          </p>
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl py-20 md:py-28">
        <p className="label">Crossings</p>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl md:text-5xl">{brand.crossingsLine}</h2>
        <p className="mt-4 max-w-xl text-ivory-muted">{brand.crossingsSupport} City-level only. Never live location.</p>
        <Button href="/member/crossings" variant="ghost" className="mt-8">
          Preview Crossings
        </Button>
      </section>

      <section className="safe-pad mx-auto max-w-6xl border-t border-[var(--line)] py-20 md:py-28">
        <p className="label">Experiences</p>
        <p className="mt-2 text-sm text-ivory-dim">
          DEMO listings. None of these are completed real-world events.
        </p>
        <ul className="mt-10 grid gap-3">
          {store.events.map((e) => (
            <li key={e.id} className="border-b border-[var(--line)] py-5">
              <p className="label">{e.listingState} · {e.kind}</p>
              <p className="mt-2 font-serif text-2xl">{e.title}</p>
              <p className="mt-2 text-sm text-ivory-muted">{e.summary}</p>
            </li>
          ))}
        </ul>
        <Button href="/member/events" variant="ghost" className="mt-8">
          Open DEMO experiences
        </Button>
      </section>

      <section className="safe-pad mx-auto max-w-3xl py-16 text-center md:py-24">
        <p className="label">Admissions</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight">{brand.scarcity}</h2>
        <p className="mx-auto mt-5 max-w-xl text-ivory-muted">
          Internally, up to ten. When the month is full, further approvals stop
          unless a steward overrides and others move to a later cohort or the
          waitlist. DEMO remaining this preview cohort: {remaining}.
        </p>
        <p className="mt-4 text-gold">{brand.referralTone}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/apply">Begin application</Button>
          <Button href="/remind" variant="ghost">Waitlist reminder</Button>
          <Button href="/referral" variant="ghost">Enter a referral</Button>
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl border-t border-[var(--line)] py-20 md:py-28">
        <p className="label">Membership</p>
        <p className="mt-3 max-w-lg text-sm text-ivory-dim">
          Lifetime membership is approved at {LIFETIME_PRICE_LABEL}. Monthly billing comes later — it is not offered here.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {customerFacingProducts.map((p) => (
            <article key={p.id} className="panel oh-card p-6 md:p-8">
              <h3 className="font-serif text-3xl">{p.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{p.summary}</p>
              <p className="mt-8 text-[11px] tracking-[0.18em] uppercase text-gold">
                {p.priceLabel}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-ivory-dim">
          Checkout is Stripe-hosted after a human approval — never a public buy button.
          Prepared domain: {brand.preparedDomain} (not purchased).
        </p>
      </section>

      <section className="border-y border-[var(--line)] bg-[rgba(12,28,40,0.22)] py-20 md:py-28">
        <div className="safe-pad mx-auto max-w-6xl">
          <p className="label">House rule</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl">{SOLICITING_BAN}</h2>
          <p className="mt-4 max-w-xl text-ivory-muted leading-relaxed">{COMMUNITY_STANDARD}</p>
        </div>
      </section>

      <section className="safe-pad mx-auto max-w-6xl py-20 md:py-28">
        <p className="label">DEMO member walkthrough</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <p className="font-serif text-3xl">Initials, not faces. Synthetic only.</p>
          <DemoMark />
        </div>
        <p className="mt-4 max-w-xl text-sm text-ivory-dim">
          These are fictional composites. Optional fields respect DEMO privacy. Real member
          profiles are never public and never indexed.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {walkthrough.map((p) => (
            <Link key={p.id} href={`/member/members/${p.id}`} className="panel oh-card p-4">
              <div
                className="flex h-16 w-16 items-center justify-center font-serif text-xl"
                style={{ background: p.accent }}
              >
                {p.initials}
              </div>
              <p className="mt-3 font-serif text-xl">{p.displayName}</p>
              <p className="text-sm text-ivory-muted">{p.roleTitle} · {p.city}</p>
              {p.website ? <p className="mt-2 text-[11px] text-ivory-dim">{p.website}</p> : null}
            </Link>
          ))}
        </div>
      </section>

      <footer className="safe-pad mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-[var(--line)] py-10 text-[11px] tracking-[0.16em] uppercase text-ivory-dim">
        <p>{brand.name} · {brand.preparedDomain}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/community">Community</Link>
          <Link href="/sign-in">Member Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
