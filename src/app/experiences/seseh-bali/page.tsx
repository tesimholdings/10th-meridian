import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicFooter } from "@/components/open-house/public-footer";
import { PublicHeader } from "@/components/open-house/public-header";
import { TripStory } from "@/components/trips/trip-story";
import { Button } from "@/components/ui/button";
import { resolveAccessContext } from "@/lib/access/context";
import { rosterForEvent } from "@/lib/events/attendance";
import { getPreviewStore } from "@/lib/preview/store";
import { SESEH_PLACE_CAPTION, SESEH_TRIP } from "@/lib/trips/seseh";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: SESEH_TRIP.title,
  description: `${SESEH_TRIP.whenLabel}. ${SESEH_TRIP.priceLine}. ${SESEH_TRIP.summary}`,
};

export default async function SesehTripPage() {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    redirect("/");
  }

  const store = getPreviewStore();
  const event = store.events.find((row) => row.id === SESEH_TRIP.eventId);
  const roster = event
    ? rosterForEvent(
        event.id,
        store.profiles,
        store.eventRegs,
        new Map(store.profiles.map((profile) => [profile.id, profile.attendingEventIds])),
      )
    : { going: [], waitlist: [] };
  const memberHref = `/member/events/${SESEH_TRIP.eventId}`;
  const ctaHref = access.decision.isMemberAccess ? memberHref : "/apply";
  const ctaLabel = access.decision.isMemberAccess ? "Register or join the waitlist" : "Request a spot";

  return (
    <div className="house-light text-[var(--navy)]">
      <PublicHeader overlay />
      <main>
        <section className="trip-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SESEH_TRIP.hero} alt="" className="trip-hero-photo" />
          <div className="trip-hero-scrim" aria-hidden />
          <div className="oh-wrap relative z-10 flex min-h-[76svh] flex-col justify-end pb-14 pt-28 md:min-h-[88svh] md:pb-20">
            <p className="text-[0.72rem] font-medium tracking-[0.18em] text-[#faf8f2]">
              {SESEH_TRIP.kicker}
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-[2.45rem] leading-[0.96] text-[#faf8f2] md:text-6xl xl:text-7xl">
              {SESEH_TRIP.title}
            </h1>
            <p className="mt-4 text-[#faf8f2]/90">{SESEH_TRIP.hostLine}</p>
            <p className="mt-2 text-[#d4af6a]">
              {SESEH_TRIP.whenLabel}
              <span> · {SESEH_TRIP.place}</span>
            </p>
            <p className="mt-2 text-[#faf8f2]">
              {SESEH_TRIP.priceLine}
              <span className="text-[#faf8f2]/80"> · {SESEH_TRIP.capacity} founders</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href={ctaHref}>{ctaLabel}</Button>
              {access.decision.isMemberAccess ? null : (
                <Link href="/sign-in" className="min-h-11 text-sm text-[#faf8f2] underline-offset-4 hover:underline">
                  Already a member? Sign in
                </Link>
              )}
            </div>
          </div>
          <p className="sr-only">{SESEH_PLACE_CAPTION}</p>
        </section>

        <div className="oh-wrap py-16 md:py-24">
          <TripStory
            going={roster.going.length}
            waitlist={roster.waitlist.length}
            cta={
              <div className="flex flex-wrap items-center gap-4">
                <Button href={ctaHref} variant="navy">
                  {ctaLabel}
                </Button>
                <p className="text-sm text-[var(--navy-soft)]">{SESEH_TRIP.scheduleNote}</p>
              </div>
            }
          />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
