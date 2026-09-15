import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { RegisterButton } from "@/components/events/register-button";
import { getPreviewStore } from "@/lib/preview/store";
import { HiggsfieldSlot } from "@/components/brand/higgsfield-slot";
import { stillForListedExperience, occasionCredit } from "@/lib/atmosphere/campaign";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";
import { formatEventWhen } from "@/lib/events/when";

export const metadata = { title: "Experience", robots: { index: false } };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const event = getPreviewStore().events.find((e) => e.id === id);
  if (!event) notFound();

  return (
    <MemberShell user={access.user} demo title="Experience" hasHeading>
      <HiggsfieldSlot
        src={campaignSrc(stillForListedExperience(event))}
        credit={occasionCredit(event.title, event.city)}
      />
      <p className="mt-4 text-sm text-[var(--ivory-dim)]">
        {event.listingState === "concept" ? "Concept" : "Planned"} — this has not occurred
      </p>
      <h1 className="mt-2 font-serif text-4xl">{event.title}</h1>
      <p className="mt-4 text-[var(--navy-soft)]">{event.longDescription ?? event.summary}</p>
      <dl className="mt-8 grid gap-4">
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
            {event.capacity} · {event.registered} listed · {event.waitlist} waitlist
          </dd>
        </div>
        {event.paymentRequired ? (
          <div>
            <dt className="label">Payment</dt>
            <dd className="mt-1 text-ivory-muted">
              Optional Stripe event payment when a Price ID exists. None is invented here.
            </dd>
          </div>
        ) : null}
      </dl>
      <RegisterButton eventId={event.id} />
    </MemberShell>
  );
}
