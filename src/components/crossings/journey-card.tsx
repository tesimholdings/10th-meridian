import Link from "next/link";
import { friendlyDate } from "@/components/crossings/local-time";
import type { JourneyRecord } from "@/lib/crossings/types";
import { effectiveJourneyStatus } from "@/lib/crossings/dates";

export function JourneyCard({
  journey,
  href,
}: {
  journey: JourneyRecord;
  href?: string;
}) {
  const status = effectiveJourneyStatus(journey);
  const inner = (
    <article className="journey-card">
      <p className="label">
        {journey.isDemo
          ? "Upcoming journey · SYNTHETIC DEMO"
          : "Upcoming journey"}
      </p>
      <h2 className="mt-2 font-serif text-3xl">
        {journey.destinationCity}
        <span className="journey-country">{journey.destinationCountry}</span>
      </h2>
      <p className="mt-2 text-sm text-ivory-muted">
        {friendlyDate(journey.arrivalDate)} →{" "}
        {friendlyDate(journey.departureDate)}
        {journey.flexibleDates ? " · flexible" : ""}
      </p>
      <p className="mt-1 text-[11px] tracking-[0.16em] uppercase text-gold">
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
