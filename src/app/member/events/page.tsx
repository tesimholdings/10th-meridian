import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { getPreviewStore } from "@/lib/preview/store";
import { HiggsfieldSlot } from "@/components/brand/higgsfield-slot";
import { stillForListedExperience, occasionCredit } from "@/lib/atmosphere/campaign";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";
import { formatEventWhen } from "@/lib/events/when";

export const metadata = { title: "Events", robots: { index: false } };

export default async function EventsPage() {
  const access = await resolveAccessContext();
  const events = getPreviewStore().events;
  return (
    <MemberShell user={access.user} demo title="Experiences" hasHeading>
      <h1 className="font-serif text-4xl">Experiences</h1>
      <ul className="mt-8 grid gap-6">
        {events.map((e, i) => (
          <li key={e.id}>
            <Link href={`/member/events/${e.id}`} className="block">
              <HiggsfieldSlot
                src={campaignSrc(stillForListedExperience(e, i))}
                credit={occasionCredit(e.title, e.city)}
              />
              <p className="mt-3 font-serif text-3xl">{e.title}</p>
              <p className="mt-1 text-sm text-[var(--navy-soft)]">
                {formatEventWhen(e.startsAt, e.city)} · {e.city}
              </p>
              <p className="mt-1 text-sm text-[var(--ivory-dim)]">
                {e.listingState === "concept" ? "Concept — has not occurred" : "Planned — has not occurred"}
                {" · "}
                {e.registered} going
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </MemberShell>
  );
}
