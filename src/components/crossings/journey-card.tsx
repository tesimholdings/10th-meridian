import type { JourneyRecord } from "@/lib/crossings/types";
import { formatCity, effectiveJourneyStatus } from "@/lib/crossings/dates";
import { formatHumanDateRange } from "@/lib/crossings/format";
import { OccasionFrame } from "@/components/events/occasion-frame";
import { journeyStillSrc } from "@/lib/atmosphere/resolve-campaign";
import type { Face } from "@/lib/events/attendance";

export function JourneyCard({
  journey,
  href,
  people = [],
  src,
}: {
  journey: JourneyRecord;
  href?: string;
  people?: Face[];
  src?: string;
}) {
  const status = effectiveJourneyStatus(journey);
  const place = formatCity(journey.destinationCity, journey.destinationCountry);
  return (
    <OccasionFrame
      href={href}
      src={src ?? journeyStillSrc(journey)}
      kicker={journey.isDemo ? "Upcoming trip · sample" : "Upcoming trip"}
      title={journey.destinationCity}
      place={place}
      when={
        formatHumanDateRange(journey.arrivalDate, journey.departureDate) +
        (journey.flexibleDates ? " · flexible" : "")
      }
      detail={`${status} · ${journey.intents.join(" · ")}`}
      people={people}
    />
  );
}
