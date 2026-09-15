import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { HeroStage } from "@/components/cinematic/hero-stage";
import { HiggsfieldSlot } from "@/components/brand/higgsfield-slot";
import { EDITORIAL_CAPTION, stillForListedExperience } from "@/lib/atmosphere/campaign";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/site";
import type { AccessContext } from "@/lib/access/context";
import { acceptedThisCohort, getPreviewStore } from "@/lib/preview/store";
import { LIFETIME_PRICE_LABEL, SOLICITING_BAN } from "@/lib/copy/community";
import { formatHumanDateTime } from "@/lib/crossings/format";

export function OpenHouseLanding({ access }: { access: AccessContext }) {
  const store = getPreviewStore();
  const remaining = Math.max(0, store.admissionsCap - acceptedThisCohort());

  return (
    <div className="bg-[var(--paper)] text-[var(--navy)]">
      <HeroStage
        caption={EDITORIAL_CAPTION}
        src={campaignSrc("heroLandscape")}
        mobileSrc={campaignSrc("heroMobile")}
      >
        <div className="safe-pad safe-top mx-auto flex min-h-[86dvh] max-w-6xl flex-col justify-between py-8">
          <Wordmark />
          <div className="rise max-w-xl pb-20 text-ivory">
            <h1 className="oh-title font-serif text-[2.8rem] leading-[0.94] md:text-6xl">{brand.idea}</h1>
            <p className="mt-5 max-w-md text-base text-ivory/85">
              A private house for the next conversation that matters.
            </p>
            <div className="mt-8 hidden gap-3 md:flex">
              <Button href="/apply">Apply</Button>
              <Button href="/member/home" variant="ghost">
                Walk the house
              </Button>
            </div>
          </div>
        </div>
      </HeroStage>

      <div
        className="safe-pad sticky bottom-0 z-30 border-t border-[var(--line)] bg-[rgba(250,248,242,0.94)] py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button href="/apply" className="!min-h-11">Apply</Button>
          <Button href="/member/home" variant="ghost" className="!min-h-11">Walk in</Button>
        </div>
      </div>

      <section className="safe-pad mx-auto grid max-w-6xl gap-8 py-16 md:grid-cols-3 md:py-24">
        {[
          { t: "People first", d: "A private circle of who you should know next — never a public feed." },
          { t: "When paths cross", d: "Crossings when you land in the same city. City-level only." },
          { t: "A closed table", d: "Ten new members a month. Lifetime membership, once." },
        ].map((b) => (
          <article key={b.t}>
            <h2 className="font-serif text-3xl">{b.t}</h2>
            <p className="mt-2 text-[var(--navy-soft)]">{b.d}</p>
          </article>
        ))}
      </section>

      <section className="safe-pad mx-auto max-w-6xl pb-16">
        <h2 className="font-serif text-4xl">Experiences</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {store.events.map((e, i) => (
            <li key={e.id}>
              <HiggsfieldSlot src={campaignSrc(stillForListedExperience(e, i))} />
              <p className="mt-3 font-serif text-2xl">{e.title}</p>
              <p className="text-sm text-[var(--ivory-dim)]">
                {formatHumanDateTime(e.startsAt)} · {e.city} · {e.listingState === "concept" ? "Concept" : "Planned"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="safe-pad mx-auto max-w-3xl py-16 text-center">
        <p className="text-sm text-[var(--gold)]">Membership</p>
        <h2 className="mt-2 font-serif text-4xl">{LIFETIME_PRICE_LABEL} lifetime</h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--navy-soft)]">
          One membership. {brand.scarcity} Monthly billing is not offered.
          {access.referralValid ? " A referral is honored at the door — not a promise." : ""}
        </p>
        <p className="mt-4 text-sm text-[var(--navy)]">{SOLICITING_BAN}</p>
        <p className="mt-2 text-xs text-[var(--ivory-dim)]">DEMO remaining this cohort: {remaining}.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/apply">Apply</Button>
          <Button href="/remind" variant="ghost">Waitlist</Button>
        </div>
      </section>

      <footer className="safe-pad mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-[var(--line)] py-10 text-sm text-[var(--ivory-dim)]">
        <p>{brand.name}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/community">Community</Link>
          <Link href="/sign-in">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
