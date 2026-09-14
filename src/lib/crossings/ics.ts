import type { CrossingRequestRecord, JourneyRecord } from "@/lib/crossings/types";
import { formatCity, zonedDayRange } from "@/lib/crossings/dates";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function icsStamp(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function crossingIcs(input: {
  request: CrossingRequestRecord;
  journey: JourneyRecord;
  fromName: string;
  toName: string;
  now?: Date;
}): string {
  const date = input.request.proposedDates[0] ?? input.journey.arrivalDate;
  const { start, end } = zonedDayRange(date.slice(0, 10), input.journey.timezone);
  const city = formatCity(input.journey.destinationCity, input.journey.destinationCountry);
  const summary = `A Crossing in ${input.journey.destinationCity}`;
  const description = [
    "SYNTHETIC DEMO — city-level presence only.",
    `${input.fromName} and ${input.toName}.`,
    "Not real-time location sharing. Exact venues are never placed on a public calendar.",
    input.request.note ? `Note: ${input.request.note}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  const uid = `${input.request.id}@10thmeridian.crossings`;
  const stamp = icsStamp(input.now ?? new Date());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//10th Meridian//Crossings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeIcs(city)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
