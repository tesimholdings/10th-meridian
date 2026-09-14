import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { Button } from "@/components/ui/button";
import { JourneyCard } from "@/components/crossings/journey-card";
import { RequestInbox } from "@/components/crossings/request-inbox";
import { EmptyState } from "@/components/crossings/states";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { matchesForJourney, refreshNotifications, tableSuggestionsFor, visibleJourneysFor } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { demoIndexFor } from "@/lib/matching/service";
import { DEFAULT_NOTIFICATION_PREFS } from "@/lib/crossings/notifications";

export const metadata = { title: "Crossings", robots: { index: false } };

export default async function CrossingsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
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
  const notifications = refreshNotifications(store.crossings, viewer, store.profiles);
  const prefs = store.crossings.prefs.find((p) => p.profileId === viewer.id) ?? {
    profileId: viewer.id,
    ...DEFAULT_NOTIFICATION_PREFS,
  };

  return (
    <MemberShell user={access.user} demo title="Crossings">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Crossings</h1>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">{CROSSINGS_COPY.support}</p>
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
          <JourneyCard journey={upcoming} href={`/member/crossings/${upcoming.id}`} />
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

      {matches.length ? (
        <p className="mt-8 text-sm text-[var(--ivory-dim)]">
          {matches.length} people may cross your path in {upcoming?.destinationCity}. Digest: {prefs.digest}.
        </p>
      ) : null}

      {tables.length ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Open a table</h2>
          {tables.map((t) => (
            <article key={`${t.city}-${t.country}`} className="mt-3">
              <p className="font-serif text-xl">
                {t.count} paths cross in {t.city}.
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

      {notifications.length ? (
        <p className="mt-8 text-sm text-[var(--ivory-dim)]">{notifications[0].title}</p>
      ) : null}

      {mine.length > 1 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Your trips</h2>
          <div className="mt-4 grid gap-3">
            {mine.map((j) => (
              <JourneyCard key={j.id} journey={j} href={`/member/crossings/${j.id}`} />
            ))}
          </div>
        </section>
      ) : null}
    </MemberShell>
  );
}
