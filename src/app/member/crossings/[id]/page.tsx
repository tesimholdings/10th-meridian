import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { CityAtlas } from "@/components/crossings/city-atlas";
import { JourneyCard } from "@/components/crossings/journey-card";
import { JourneyControls } from "@/components/crossings/journey-controls";
import { MatchCarousel } from "@/components/crossings/match-carousel";
import { PrivacyNotice } from "@/components/crossings/states";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { matchesForJourney } from "@/lib/crossings/service";
import { demoIndexFor } from "@/lib/matching/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { journeyCompanions } from "@/lib/events/attendance";
import { journeyStillSrc } from "@/lib/atmosphere/resolve-campaign";

export const metadata = { title: "Journey", robots: { index: false } };

export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const journey = store.crossings.journeys.find((j) => j.id === id);
  if (!journey || journey.status === "deleted") notFound();
  const index = await demoIndexFor(viewer);
  const matches = matchesForJourney({
    state: store.crossings,
    viewer,
    journey,
    members: store.profiles,
    meridian: index,
  });
  const owner = journey.profileId === viewer.id;
  const canMutate = canMutateCrossings(access.user?.role);

  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.name}>
      <JourneyCard
        journey={journey}
        src={journeyStillSrc(journey)}
        people={journeyCompanions(journey.destinationCity, store.crossings.journeys, store.profiles)}
      />
      <div className="mt-4">
        <PrivacyNotice />
      </div>
      {owner && canMutate ? (
        <>
          <Link
            href={`/member/crossings/${journey.id}/edit`}
            className="mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-gold"
          >
            Edit coordinates
          </Link>
          <JourneyControls journey={journey} />
        </>
      ) : null}
      {owner ? (
      <section className="mt-10">
        <p className="label">People in this city</p>
        <p className="mt-2 max-w-xl text-sm text-ivory-muted">
          A city-level list — locals, fellow travelers, City Hosts, and My Circle. Never a map, never
          ranked by wealth, popularity, or how often someone writes.
        </p>
        <div className="mt-4">
          <CityAtlas
            journey={journey}
            matches={matches}
            circleIds={store.circle.filter((e) => e.ownerId === viewer.id).map((e) => e.memberId)}
          />
        </div>
        <div className="mt-6">
          <MatchCarousel matches={matches} journeyId={journey.id} canMutate={canMutate} />
        </div>
      </section>
      ) : (
        <section className="mt-10">
          <CityAtlas journey={journey} matches={[]} />
          <p className="mt-4 text-sm text-ivory-dim">
            Destination rankings stay with the traveler. Historical Crossings remain private.
          </p>
        </section>
      )}
    </MemberShell>
  );
}
