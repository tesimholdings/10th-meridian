import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { Button } from "@/components/ui/button";
import { JourneyCard } from "@/components/crossings/journey-card";
import { CityAtlas } from "@/components/crossings/city-atlas";
import { RequestInbox } from "@/components/crossings/request-inbox";
import { EmptyState, PrivacyNotice } from "@/components/crossings/states";
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
      <div className="relative overflow-hidden border border-[rgba(198,164,90,0.4)] water p-6 md:p-8">
        <p className="label">{CROSSINGS_COPY.name}</p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[0.95] md:text-5xl">{CROSSINGS_COPY.line}</h1>
        <p className="mt-4 max-w-lg text-ivory-muted">{CROSSINGS_COPY.support}</p>
        {canMutate ? (
          <div className="mt-6">
            <Button href="/member/crossings/new">{CROSSINGS_COPY.createAction}</Button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-gold">
            Open House walkthrough — SYNTHETIC DEMO only. Active members set coordinates.
          </p>
        )}
      </div>

      <div className="mt-8">
        <PrivacyNotice />
      </div>

      <section className="mt-10">
        {upcoming ? (
          <JourneyCard journey={upcoming} href={`/member/crossings/${upcoming.id}`} />
        ) : (
          <EmptyState
            title="No journey on the water."
            body="Set Your Coordinates when you know the city — not the flight, not the hotel."
            action={
              canMutate ? (
                <Button href="/member/crossings/new">{CROSSINGS_COPY.createAction}</Button>
              ) : undefined
            }
          />
        )}
      </section>

      <section className="mt-10">
        <p className="label">Where paths may cross</p>
        <div className="mt-4">
          <CityAtlas journey={upcoming} matches={matches.slice(0, 8)} />
        </div>
      </section>

      {notifications.length ? (
        <section className="mt-10">
          <p className="label">Quiet notices</p>
          <ul className="mt-4 grid gap-3">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="border-b border-[var(--line)] py-3">
                <p className="font-serif text-xl">{n.title}</p>
                <p className="text-sm text-ivory-muted">{n.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
            Digest: {prefs.digest} · never repeated
          </p>
        </section>
      ) : null}

      {tables.length ? (
        <section className="mt-10">
          <p className="label">Open a Table</p>
          {tables.map((t) => (
            <article key={`${t.city}-${t.country}`} className="panel mt-3 p-5">
              <p className="font-serif text-2xl">
                {t.count} paths cross in {t.city}.
              </p>
              <p className="mt-2 text-sm text-ivory-muted">A private group meal. Neighborhood, not a public venue.</p>
              {canMutate ? (
                <Link
                  href={`/member/crossings/tables/new?city=${encodeURIComponent(t.city)}&country=${encodeURIComponent(t.country)}`}
                  className="mt-3 inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-gold"
                >
                  Open a Table
                </Link>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      <section className="mt-12">
        <p className="label">A Crossing — requests</p>
        <div className="mt-4">
          <RequestInbox requests={requests} viewerId={viewer.id} canMutate={canMutate} />
        </div>
      </section>

      <nav className="mt-12 grid gap-3 md:grid-cols-3">
        <Link href="/member/crossings/notes" className="panel-quiet p-5">
          <p className="label">City Notes</p>
          <p className="mt-3 font-serif text-2xl">A private guide</p>
        </Link>
        <Link href="/member/crossings/hosts" className="panel-quiet p-5">
          <p className="label">City Hosts</p>
          <p className="mt-3 font-serif text-2xl">A member welcome</p>
        </Link>
        <Link href="/member/crossings/tables" className="panel-quiet p-5">
          <p className="label">Tables</p>
          <p className="mt-3 font-serif text-2xl">Shared meals</p>
        </Link>
      </nav>

      {mine.length > 1 ? (
        <section className="mt-12">
          <p className="label">Your journeys</p>
          <div className="mt-4 grid gap-3">
            {mine.map((j) => (
              <JourneyCard key={j.id} journey={j} href={`/member/crossings/${j.id}`} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-12 text-[11px] leading-relaxed text-ivory-dim">
        Navigation: Crossings lives on Home and at /member/crossings. The five-item member bar (Home ·
        Index · Channels · Members · Profile) is unchanged.
      </p>
    </MemberShell>
  );
}
