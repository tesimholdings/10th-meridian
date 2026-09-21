import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MatchBoard } from "@/components/matches/match-board";
import { demoIndexFor } from "@/lib/matching/service";
import { getPreviewStore, unreadHouseNotifications, unreadTotal, viewerProfile, viewerRewardsSnapshot } from "@/lib/preview/store";
import { completionMessage } from "@/lib/profile/completion";
import { formatHumanDateRange } from "@/lib/crossings/format";
import { formatEventWhen, isEventTonight } from "@/lib/events/when";
import { visibleJourneysFor } from "@/lib/crossings/service";
import { RewardsTeaserCard } from "@/components/rewards/teaser-card";
import { formatPoints } from "@/lib/rewards/math";
import { CrossingsEntryLink } from "@/components/crossings/crossings-flight";
import { FRESH_PREVIEW_ACCOUNT_ID } from "@/lib/profile/onboarding";

export const metadata = { title: "Home", robots: { index: false } };

export default async function MemberHomePage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const index = await demoIndexFor(viewer);
  const paymentPending = access.user?.role === "approved_unpaid";
  const first =
    access.user?.id === FRESH_PREVIEW_ACCOUNT_ID
      ? (access.user.name.split(" ")[0] ?? access.user.name)
      : (viewer.displayName.split(" ")[0] ?? viewer.displayName);
  const journeys = visibleJourneysFor({
    state: store.crossings,
    viewerId: viewer.id,
    viewerRole: access.user?.role ?? null,
    meridianMatchIds: index.meridian100.map((m) => m.target.id),
    sharedChannelIds: store.channels.map((c) => c.id),
  });
  const trip = journeys.find((j) => j.profileId === viewer.id && j.status === "active");
  const upcomingEvents = [...store.events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const tonight = upcomingEvents.find((e) => isEventTonight(e));
  const event = tonight ?? upcomingEvents[0];
  const eventChipLabel = event && isEventTonight(event) ? "Tonight" : "Next";
  const rewards =
    access.user?.role === "member" ||
    access.user?.role === "moderator" ||
    access.user?.role === "administrator"
      ? viewerRewardsSnapshot()
      : null;

  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess || viewer.isDemo} title="Home" hasHeading>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--ivory-dim)]">Good evening</p>
          <h1 className="font-serif text-4xl">{first}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/member/notifications" className="surface pressable flex h-11 w-11 items-center justify-center rounded-full">
            <span className="sr-only">Notifications</span>
            {unreadHouseNotifications(viewer.id) ? <span className="unread-dot" /> : <span className="text-lg">•</span>}
          </Link>
          <Link href="/member/messages" className="surface pressable flex h-11 w-11 items-center justify-center rounded-full text-sm">
            {unreadTotal()}
          </Link>
        </div>
      </div>

      {viewer.completion < 90 ? (
        <p className="mt-4 text-sm text-[var(--ivory-dim)]">{completionMessage(viewer.completion)}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <RailChip href="/member/messages" label="Messages" value={`${unreadTotal()} new`} />
        <RailChip href="/member/crossings" label="Next city" value={trip ? trip.destinationCity : "Add a trip"} crossings />
        <RailChip href="/member/events" label={eventChipLabel} value={event?.city ?? "Experiences"} />
        {rewards ? (
          <RailChip href="/member/rewards" label="Rewards" value={formatPoints(rewards.availablePoints)} />
        ) : null}
      </div>

      {trip ? (
        <CrossingsEntryLink
          href={`/member/crossings/${trip.id}`}
          className="surface pressable mt-8 block rounded-3xl px-5 py-6 md:px-7 md:py-7"
        >
          <p className="text-xs tracking-[0.18em] uppercase text-[var(--ivory-dim)]">Your Crossing</p>
          <p className="mt-3 font-serif text-4xl">{trip.destinationCity}</p>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">
            {formatHumanDateRange(trip.arrivalDate, trip.departureDate)}
          </p>
          <p className="mt-5 text-sm text-[var(--gold)]">Open this trip</p>
        </CrossingsEntryLink>
      ) : (
        <CrossingsEntryLink href="/member/crossings/new" className="surface pressable mt-8 block rounded-3xl px-5 py-6 text-[var(--navy)]">
          Add a trip
        </CrossingsEntryLink>
      )}

      {event ? (
        <Link href={`/member/events/${event.id}`} className="surface pressable mt-8 block rounded-3xl px-5 py-6 md:px-7 md:py-7">
          <p className="text-xs tracking-[0.18em] uppercase text-[var(--ivory-dim)]">Upcoming experience</p>
          <p className="mt-3 font-serif text-4xl">{event.title}</p>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">
            {formatEventWhen(event.startsAt, event.city)} · {event.city}
          </p>
          <p className="mt-5 text-sm text-[var(--gold)]">Open this experience</p>
        </Link>
      ) : null}

      <section className="mt-10">
        <p className="text-sm text-[var(--ivory-dim)]">Useful connections</p>
        <div className="mt-3">
          <MatchBoard
            index={index}
            intros={store.intros}
            compact
            circleIds={store.circle.filter((e) => e.ownerId === viewer.id).map((e) => e.memberId)}
          />
        </div>
      </section>

      {rewards ? (
        <div className="mt-10">
          <RewardsTeaserCard availablePoints={rewards.availablePoints} />
        </div>
      ) : null}

      {paymentPending ? (
        <Link href="/member/settings#billing" className="mt-10 block text-sm text-[var(--gold)]">
          Membership approved — finish Founding $5,000 or Standard $10,000 + $195/month in billing
        </Link>
      ) : null}
    </MemberShell>
  );
}

function RailChip({
  href,
  label,
  value,
  crossings = false,
}: {
  href: string;
  label: string;
  value: string;
  crossings?: boolean;
}) {
  const ChipLink = crossings ? CrossingsEntryLink : Link;
  return (
    <ChipLink href={href} className="surface block w-full min-w-0 rounded-2xl px-4 py-3">
      <p className="text-xs text-[var(--ivory-dim)]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </ChipLink>
  );
}
