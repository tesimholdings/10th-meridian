import Link from "next/link";
import { EditorialFilm } from "@/components/open-house/editorial-film";
import { HeroAtmosphere } from "@/components/open-house/hero-atmosphere";
import { HeroMedia } from "@/components/open-house/hero-media";
import { PublicFooter } from "@/components/open-house/public-footer";
import { PublicHeader } from "@/components/open-house/public-header";
import { Button } from "@/components/ui/button";
import {
  OPEN_HOUSE_CLOSING_MEDIA,
  OPEN_HOUSE_EXPERIENCE_MEDIA,
  OPEN_HOUSE_HOUSE_MEDIA,
  stillForListedExperience,
} from "@/lib/atmosphere/campaign";
import { campaignSrc, filmSrc, globalSrc } from "@/lib/atmosphere/resolve-campaign";
import type { AccessContext } from "@/lib/access/context";
import {
  APPLY_LABEL,
  CLOSING_HEADLINE,
  EXPERIENCES_DISCLOSURE,
  EXPLORE_THE_HOUSE,
  HOUSE_BLOCKS,
  JOIN_WAITLIST,
  MEMBERSHIP_CAP,
  MEMBERSHIP_HEADLINE,
  MEMBERSHIP_NO_MONTHLY,
  MEMBERSHIP_SOLICITING,
  OPEN_HOUSE_EYEBROW,
  OPEN_HOUSE_HEADLINE,
  OPEN_HOUSE_LEDE,
  OPEN_HOUSE_PROOF,
  experienceStateLabel,
  experiences,
} from "@/lib/copy/open-house";

export function OpenHouseLanding({ access }: { access: AccessContext }) {
  return (
    <div className="house-light bg-[var(--paper)] text-[var(--navy)]">
      <PublicHeader overlay landing />
      <main>
        <Hero />
        <HouseStory />
        <ExperiencesRail />
        <Membership access={access} />
        <Closing />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-luxury relative isolate min-h-[76svh] overflow-hidden text-ivory md:min-h-[90svh]">
      <div className="hero-media-shift">
        <HeroMedia
          src={campaignSrc("heroLandscape")}
          mobileSrc={campaignSrc("heroMobile")}
          videoSrc={filmSrc("heroLandscape")}
        />
      </div>
      <HeroAtmosphere />
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(9,43,69,0.22) 0%, rgba(9,43,69,0.08) 36%, rgba(9,43,69,0.28) 70%, rgba(250,248,242,0.96) 100%)",
        }}
      />
      <div className="oh-wrap relative z-10 flex min-h-[76svh] flex-col justify-end pb-16 pt-28 md:min-h-[90svh] md:pb-24">
        <p className="text-[0.72rem] font-medium tracking-[0.18em] text-[#faf8f2] [text-shadow:0_1px_12px_rgba(9,43,69,0.35)]">
          {OPEN_HOUSE_EYEBROW}
        </p>
        <h1 className="oh-title mt-4 max-w-3xl font-serif text-[2.6rem] leading-[0.96] text-[#faf8f2] [text-shadow:0_2px_24px_rgba(9,43,69,0.35)] md:max-w-4xl md:text-6xl xl:text-7xl">
          {OPEN_HOUSE_HEADLINE}
        </h1>
        <p className="mt-5 max-w-md text-base text-[#faf8f2]/90 [text-shadow:0_1px_12px_rgba(9,43,69,0.35)]">
          {OPEN_HOUSE_LEDE}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/apply">{APPLY_LABEL}</Button>
          <Button href="#the-house" variant="ghost">
            {EXPLORE_THE_HOUSE}
          </Button>
        </div>
        <p className="mt-8 text-sm text-[#faf8f2]/80">{OPEN_HOUSE_PROOF}</p>
      </div>
    </section>
  );
}

function HouseStory() {
  return (
    <section id="the-house" className="oh-wrap scroll-mt-24 py-16 md:py-24">
      <p className="text-xs font-medium tracking-[0.16em] text-[var(--gold-dim)]">THE HOUSE</p>
      <div className="mt-8 grid gap-10 md:grid-cols-3">
        {HOUSE_BLOCKS.map((block, i) => {
          const media = OPEN_HOUSE_HOUSE_MEDIA[i];
          return (
            <article key={block.id}>
              <EditorialFilm
                poster={media ? globalSrc(media.global, media.fallback) : campaignSrc(block.still)}
                videoSrc={media ? filmSrc(media.film) : undefined}
              />
              <h2 className="mt-5 font-serif text-3xl">{block.title}</h2>
              <p className="mt-2 text-[var(--navy-soft)]">{block.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ExperiencesRail() {
  return (
    <section id="experiences" className="oh-wrap scroll-mt-24 pb-16 md:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif text-4xl">Experiences</h2>
        <p className="max-w-sm text-sm text-[var(--navy-soft)]">{EXPERIENCES_DISCLOSURE}</p>
      </div>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {experiences.map((item, i) => {
          const media = OPEN_HOUSE_EXPERIENCE_MEDIA[i];
          const fallback = stillForListedExperience(item, i);
          return (
          <li key={item.id}>
            {media && "film" in media && media.film ? (
              <EditorialFilm
                poster={globalSrc(media.global, fallback)}
                videoSrc={filmSrc(media.film)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media ? globalSrc(media.global, fallback) : campaignSrc(fallback)}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
            )}
            <p className="mt-3 font-serif text-2xl">{item.title}</p>
            <p className="text-sm text-[var(--navy-soft)]">
              {[item.place, experienceStateLabel(item.state)].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-sm text-[var(--navy-soft)]">{item.summary}</p>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

function Membership({ access }: { access: AccessContext }) {
  return (
    <section
      id="membership"
      className="scroll-mt-24 bg-[#092b45] py-16 text-[#faf8f2] md:py-24"
    >
      <div className="safe-pad mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium tracking-[0.16em] text-[#c4a264]">MEMBERSHIP</p>
        <h2 className="mt-3 font-serif text-5xl md:text-6xl">{MEMBERSHIP_HEADLINE}</h2>
        <ul className="mx-auto mt-8 grid max-w-lg gap-3 text-left text-base text-[#faf8f2]/90">
          <li>{MEMBERSHIP_NO_MONTHLY}</li>
          <li>{MEMBERSHIP_CAP}</li>
          <li>{MEMBERSHIP_SOLICITING}</li>
          {access.referralValid ? (
            <li>A referral is honored at the door — not a promise.</li>
          ) : null}
        </ul>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/apply">{APPLY_LABEL}</Button>
          <Button href="/remind" variant="ghost">
            {JOIN_WAITLIST}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="relative isolate overflow-hidden">
      <EditorialFilm
        poster={globalSrc(OPEN_HOUSE_CLOSING_MEDIA.global, OPEN_HOUSE_CLOSING_MEDIA.fallback)}
        videoSrc={filmSrc(OPEN_HOUSE_CLOSING_MEDIA.film)}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-[rgba(9,43,69,0.42)]" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-[22rem] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center text-[#faf8f2]">
        <h2 className="font-serif text-4xl md:text-5xl">{CLOSING_HEADLINE}</h2>
        <div className="mt-8">
          <Button href="/apply">{APPLY_LABEL}</Button>
        </div>
        <p className="mt-6">
          <Link href="/remind" className="min-h-11 text-sm text-[#faf8f2]/85 underline-offset-4 hover:underline">
            {JOIN_WAITLIST}
          </Link>
        </p>
      </div>
    </section>
  );
}
