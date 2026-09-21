import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { Button } from "@/components/ui/button";
import { JourneyCard } from "@/components/crossings/journey-card";
import { RequestInbox } from "@/components/crossings/request-inbox";
import { EmptyState } from "@/components/crossings/states";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { matchesForJourney, tableSuggestionsFor, visibleJourneysFor } from "@/lib/crossings/service";
import { journeyStillSrc } from "@/lib/atmosphere/resolve-campaign";
import { journeyCompanions } from "@/lib/events/attendance";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { demoIndexFor } from "@/lib/matching/service";
import { summarizeCityPresence } from "@/lib/crossings/presence";
import { cityCountLines } from "@/lib/member/city-counts";
import { isSyntheticSession, sessionSubjectId } from "@/lib/member/identity";

export const metadata = { title: "Crossings", robots: { index: false } };

export default async function CrossingsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const seed = viewerProfile();
  const viewer = isSyntheticSession(access.user)
    ? seed
    : { ...seed, id: sessionSubjectId(access.user, seed.id), displayName: access.user?.name ?? seed.displayName };
  const canMutate = canMutateCrossings(access.user?.role);
  const index = await demoIndexFor(viewer);
  const journeys = visibleJourneysFor({
    state: store.crossings,
    viewerId: viewer.id,
    viewerRole: access.user?.role ?? null,
    meridianMatchIds: index.meridian100.map((m) => m.target.id),
    sharedChannelIds: store.channels.map((c) => c.id),
  });
  const mine = journeys.filter((j) => j.profileId === viewer.id && j.status !== "deleted");
  const upcoming = mine.find((j) => j.status === "active");
  const matches = upcoming
    ? matchesForJourney({
        state: store.crossings,
        viewer,
        journey: upcoming,
        members: store.profiles,
        meridian: index,
      })
    : [];
  const requests = store.crossings.requests.filter(
    (r) => r.fromProfileId === viewer.id || r.toProfileId === viewer.id,
  );
  const tables = tableSuggestionsFor(store.crossings, store.profiles, viewer.id);
  const presence = upcoming ? summarizeCityPresence(matches) : null;
  const cityLines = upcoming
    ? cityCountLines({
        city: upcoming.destinationCity,
        travelers: presence?.fellow_traveler ?? 0,
        locals: presence?.local ?? 0,
        hosts: presence?.city_host ?? 0,
      })
    : [];

  return (
    <MemberShell user={access.user} demo title="Crossings" hasHeading>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="member-kicker">Travel</p>
          <h1 className="member-title">Crossings</h1>
          <p className="member-support">{CROSSINGS_COPY.support}</p>
        </div>
        {canMutate ? <Button href="/member/crossings/new">{CROSSINGS_COPY.createAction}</Button> : null}
      </div>

      <nav className="mt-6 flex gap-3 overflow-x-auto hide-scroll text-sm">
        <a href="#trips" className="pill">Trips</a>
        <a href="#requests" className="pill">Requests</a>
        <a href="#guide" className="pill">City guide</a>
      </nav>

      <section id="trips" className="mt-8">
        {upcoming ? (
          <JourneyCard
            journey={upcoming}
            href={`/member/crossings/${upcoming.id}`}
            src={journeyStillSrc(upcoming)}
            people={journeyCompanions(upcoming.destinationCity, store.crossings.journeys, store.profiles)}
          />
        ) : (
          <EmptyState
            title="No trip yet."
            body="Add a trip when you know the city — not the flight."
            action={canMutate ? <Button href="/member/crossings/new">{CROSSINGS_COPY.createAction}</Button> : undefined}
          />
        )}
      </section>

      <section id="requests" className="mt-10">
        <h2 className="font-serif text-2xl">Requests</h2>
        <div className="mt-4">
          <RequestInbox
            requests={requests}
            viewerId={viewer.id}
            canMutate={canMutate}
            profiles={store.profiles}
            journeys={store.crossings.journeys}
          />
        </div>
      </section>

      <section id="guide" className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link href="/member/crossings/notes" className="py-3">
          <p className="text-sm text-[var(--ivory-dim)]">City guide</p>
          <p className="font-serif text-2xl">Notes</p>
        </Link>
        <Link href="/member/crossings/hosts" className="py-3">
          <p className="text-sm text-[var(--ivory-dim)]">Hosts</p>
          <p className="font-serif text-2xl">A member welcome</p>
        </Link>
        <Link href="/member/crossings/tables" className="py-3">
          <p className="text-sm text-[var(--ivory-dim)]">Tables</p>
          <p className="font-serif text-2xl">Shared meals</p>
        </Link>
      </section>

      {cityLines.length ? (
        <div className="member-card mt-8 px-5 py-5">
          {cityLines.map((line) => (
            <p key={line} className="text-sm text-[var(--navy)]">
              {line}
            </p>
          ))}
          <p className="mt-2 text-sm text-[var(--ivory-dim)]">
            Recommendations from My Circle are not counted as people in the city.
          </p>
        </div>
      ) : null}

      {tables.length ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Open a table</h2>
          {tables.map((t) => (
            <article key={`${t.city}-${t.country}`} className="mt-3">
              <p className="font-serif text-xl">
                {t.count} members open to a table in {t.city}.
              </p>
              <p className="text-sm text-[var(--ivory-dim)]">
                Table candidates in overlapping trips — not the same as people who may cross your path.
              </p>
              {canMutate ? (
                <Link
                  href={`/member/crossings/tables/new?city=${encodeURIComponent(t.city)}&country=${encodeURIComponent(t.country)}`}
                  className="text-sm text-[var(--blue)]"
                >
                  Open a table
                </Link>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {mine.length > 1 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Your trips</h2>
          <div className="mt-4 grid gap-3">
            {mine.map((j) => (
              <JourneyCard
                key={j.id}
                journey={j}
                href={`/member/crossings/${j.id}`}
                src={journeyStillSrc(j)}
                people={journeyCompanions(j.destinationCity, store.crossings.journeys, store.profiles)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </MemberShell>
  );
}
