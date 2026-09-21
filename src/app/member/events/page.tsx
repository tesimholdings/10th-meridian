import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { OccasionFrame } from "@/components/events/occasion-frame";
import { getPreviewStore } from "@/lib/preview/store";
import { stillForListedExperience } from "@/lib/atmosphere/campaign";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";
import { formatEventWhen } from "@/lib/events/when";
import { rosterForEvent } from "@/lib/events/attendance";

export const metadata = { title: "Events", robots: { index: false } };

export default async function EventsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const attending = new Map(store.profiles.map((profile) => [profile.id, profile.attendingEventIds]));
  return (
    <MemberShell user={access.user} demo title="Experiences" hasHeading>
      <h1 className="font-serif text-4xl">Experiences</h1>
      <ul className="occasion-grid mt-8">
        {store.events.map((event, index) => {
          const roster = rosterForEvent(event.id, store.profiles, store.eventRegs, attending);
          return (
            <li key={event.id}>
              <OccasionFrame
                href={`/member/events/${event.id}`}
                src={campaignSrc(stillForListedExperience(event, index))}
                kicker={event.listingState === "concept" ? "Concept" : "Planned"}
                title={event.title}
                place={event.city}
                when={formatEventWhen(event.startsAt, event.city)}
                detail={event.kind === "trip" ? "A trip" : "Has not occurred"}
                people={roster.going}
              />
            </li>
          );
        })}
      </ul>
    </MemberShell>
  );
}
