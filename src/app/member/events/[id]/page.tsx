import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { RegisterButton } from "@/components/events/register-button";
import { getPreviewStore } from "@/lib/preview/store";

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
    <MemberShell user={access.user} demo title="Experience">
      <p className="label">{event.kind} · {event.listingState}</p>
      <h1 className="mt-3 font-serif text-4xl">{event.title}</h1>
      <p className="mt-4 text-ivory-muted">{event.longDescription ?? event.summary}</p>
      <p className="mt-6 text-sm text-gold">
        This has not occurred. DEMO listing only.
      </p>
      <dl className="mt-8 grid gap-4">
        <div>
          <dt className="label">City</dt>
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
