import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { RegisterButton } from "@/components/events/register-button";
import { AttendanceRoster } from "@/components/events/attendance-roster";
import { OccasionFrame } from "@/components/events/occasion-frame";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { stillForListedExperience, occasionCredit } from "@/lib/atmosphere/campaign";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";
import { formatEventWhen } from "@/lib/events/when";
import { canPromoteAttendance, rosterForEvent } from "@/lib/events/attendance";

export const metadata = { title: "Experience", robots: { index: false } };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const event = store.events.find((row) => row.id === id);
  if (!event) notFound();
  const roster = rosterForEvent(
    event.id,
    store.profiles,
    store.eventRegs,
    new Map(store.profiles.map((profile) => [profile.id, profile.attendingEventIds])),
  );
  const canPromote = canPromoteAttendance({
    role: access.user?.role,
    viewerId: viewer.id,
    hostProfileId: event.hostProfileId,
  });

  return (
    <MemberShell user={access.user} demo title="Experience" hasHeading>
      <OccasionFrame
        src={campaignSrc(stillForListedExperience(event))}
        kicker={event.listingState === "concept" ? "Concept — this has not occurred" : "Planned — this has not occurred"}
        title={event.title}
        place={event.city}
        when={formatEventWhen(event.startsAt, event.city)}
        detail={occasionCredit(event.title, event.city)}
        people={roster.going}
        heading="h1"
      />
      <p className="reading mt-8 text-[var(--navy-soft)]">{event.longDescription ?? event.summary}</p>
      <dl className="reading mt-8 grid gap-4">
        <div>
          <dt className="text-sm text-[var(--ivory-dim)]">When</dt>
          <dd className="mt-1">{formatEventWhen(event.startsAt, event.city)}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--ivory-dim)]">Place</dt>
          <dd className="mt-1">{event.city}</dd>
        </div>
        <div>
          <dt className="label">Capacity</dt>
          <dd className="mt-1">
            {event.capacity} · {roster.going.length} going · {roster.waitlist.length} waitlist
          </dd>
        </div>
        {event.paymentRequired ? (
          <div>
            <dt className="label">Payment</dt>
            <dd className="mt-1 text-ivory-muted">
              Payment is collected with the house when this experience requires it.
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="reading mt-10">
        <AttendanceRoster
          going={roster.going}
          waitlist={roster.waitlist}
          canPromote={canPromote}
          eventId={event.id}
        />
      </div>
      <RegisterButton eventId={event.id} />
    </MemberShell>
  );
}
