import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MatchBoard } from "@/components/matches/match-board";
import { demoIndexFor } from "@/lib/matching/service";
import { getPreviewStore, unreadHouseNotifications, unreadTotal, viewerProfile, viewerRewardsSnapshot } from "@/lib/preview/store";
import { completionMessage } from "@/lib/profile/completion";
import { formatHumanDateRange, formatHumanDateTime } from "@/lib/crossings/format";
import { HiggsfieldSlot } from "@/components/brand/higgsfield-slot";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";
import { visibleJourneysFor } from "@/lib/crossings/service";
import { RewardsTeaserCard } from "@/components/rewards/teaser-card";
import { formatPoints } from "@/lib/rewards/math";

export const metadata = { title: "Home", robots: { index: false } };

export default async function MemberHomePage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const index = await demoIndexFor(viewer);
  const paymentPending = access.user?.role === "approved_unpaid";
  const first = viewer.displayName.split(" ")[0] ?? viewer.displayName;
  const journeys = visibleJourneysFor({
    state: store.crossings,
    viewerId: viewer.id,
    viewerRole: access.user?.role ?? null,
    meridianMatchIds: index.meridian100.map((m) => m.target.id),
    sharedChannelIds: store.channels.map((c) => c.id),
  });
  const trip = journeys.find((j) => j.profileId === viewer.id && j.status === "active");
  const event = store.events[0];
  const rewards =
    access.user?.role === "member" ||
    access.user?.role === "moderator" ||
    access.user?.role === "administrator"
      ? viewerRewardsSnapshot()
      : null;

  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess || viewer.isDemo} title="Home">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--ivory-dim)]">Good evening</p>
          <h1 className="font-serif text-4xl">{first}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/member/notifications" className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white">
            <span className="sr-only">Notifications</span>
            {unreadHouseNotifications(viewer.id) ? <span className="unread-dot" /> : <span className="text-lg">•</span>}
          </Link>
          <Link href="/member/messages" className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm">
            {unreadTotal()}
          </Link>
        </div>
      </div>

      {viewer.completion < 90 ? (
        <p className="mt-4 text-sm text-[var(--ivory-dim)]">{completionMessage(viewer.completion)}</p>
      ) : null}

      <div className="mt-6 flex gap-3 overflow-x-auto hide-scroll">
        <RailChip href="/member/messages" label="Messages" value={`${unreadTotal()} new`} />
        <RailChip href="/member/crossings" label="Next city" value={trip ? trip.destinationCity : "Add a trip"} />
        <RailChip href="/member/events" label="Tonight" value={event?.city ?? "Experiences"} />
        {rewards ? (
          <RailChip href="/member/rewards" label="Rewards" value={formatPoints(rewards.availablePoints)} />
        ) : null}
      </div>

      {rewards ? (
        <div className="mt-8">
          <RewardsTeaserCard availablePoints={rewards.availablePoints} />
        </div>
      ) : null}

      {trip ? (
        <Link href={`/member/crossings/${trip.id}`} className="mt-8 block">
          <p className="text-sm text-[var(--ivory-dim)]">Upcoming trip</p>
          <p className="mt-1 font-serif text-3xl">{trip.destinationCity}</p>
          <p className="mt-1 text-sm text-[var(--navy-soft)]">
            {formatHumanDateRange(trip.arrivalDate, trip.departureDate)}
          </p>
        </Link>
      ) : (
        <Link href="/member/crossings/new" className="mt-8 block text-[var(--blue)]">
          Add a trip
        </Link>
      )}

      {event ? (
        <Link href={`/member/events/${event.id}`} className="mt-8 block overflow-hidden rounded-3xl">
          <HiggsfieldSlot src={campaignSrc("homeIndex")} aspect="aspect-[16/8]" />
          <div className="pt-4">
            <p className="text-sm text-[var(--ivory-dim)]">Upcoming experience</p>
            <p className="font-serif text-3xl">{event.title}</p>
            <p className="mt-1 text-sm text-[var(--navy-soft)]">
              {formatHumanDateTime(event.startsAt)} · {event.city}
            </p>
          </div>
        </Link>
      ) : null}

      <section className="mt-10">
        <HiggsfieldSlot src={campaignSrc("homeNetwork")} aspect="aspect-[16/8]" className="mb-4 rounded-3xl" />
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

      {paymentPending ? (
        <Link href="/member/settings#billing" className="mt-10 block text-sm text-[var(--gold)]">
          Membership approved — finish $10,000 lifetime in account settings
        </Link>
      ) : null}
    </MemberShell>
  );
}

function RailChip({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="min-w-[8.5rem] rounded-2xl bg-white px-4 py-3">
      <p className="text-xs text-[var(--ivory-dim)]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </Link>
  );
}
