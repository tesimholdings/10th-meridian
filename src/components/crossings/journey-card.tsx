import Link from "next/link";
import type { JourneyRecord } from "@/lib/crossings/types";
import { formatCity, effectiveJourneyStatus } from "@/lib/crossings/dates";
import { DemoMark } from "@/components/brand/demo-mark";

export function JourneyCard({
  journey,
  href,
}: {
  journey: JourneyRecord;
  href?: string;
}) {
  const status = effectiveJourneyStatus(journey);
  const inner = (
    <article className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="label">Upcoming journey</p>
        {journey.isDemo ? <DemoMark /> : null}
      </div>
      <h2 className="mt-3 font-serif text-3xl">{formatCity(journey.destinationCity, journey.destinationCountry)}</h2>
      <p className="mt-2 text-sm text-ivory-muted">
        {journey.arrivalDate} → {journey.departureDate}
        {journey.flexibleDates ? " · flexible" : ""}
      </p>
      <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-gold">
        {status} · {journey.intents.join(" · ")}
      </p>
      <p className="mt-3 text-sm text-ivory-dim">
        {journey.availability.join(", ")}
        {journey.openToGroupTable ? " · open to a table" : ""}
      </p>
    </article>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
