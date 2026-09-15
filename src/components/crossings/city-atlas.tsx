import type { JourneyRecord, TravelScoredMatch } from "@/lib/crossings/types";
import { formatCity } from "@/lib/crossings/dates";
import {
  PRESENCE_COUNT_LABELS,
  PRESENCE_KIND_LABELS,
  presenceLine,
  summarizeCityPresence,
} from "@/lib/crossings/presence";

export function CityAtlas({
  journey,
  matches,
}: {
  journey?: JourneyRecord;
  matches: TravelScoredMatch[];
}) {
  const city = journey
    ? formatCity(journey.destinationCity, journey.destinationCountry)
    : "This city";
  const summary = summarizeCityPresence(matches);

  return (
    <div className="surface overflow-hidden rounded-3xl px-5 py-5 md:px-6 md:py-6">
      <p className="text-xs tracking-[0.16em] uppercase text-[var(--ivory-dim)]">In this city</p>
      <p className="mt-2 font-serif text-3xl">{city}</p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--navy-soft)]">
        {summary.total === 0
          ? "City-level presence only. People who may cross your path appear here as a list — never as pins on a map."
          : `${summary.total} ${summary.total === 1 ? "person" : "people"} you can meet here — locals, fellow travelers, City Hosts, and My Circle.`}
      </p>

      {summary.total > 0 ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {PRESENCE_COUNT_LABELS.map((row) => (
              <div key={row.kind} className="rounded-2xl border border-[var(--line)] px-4 py-3">
                <p className="text-xs text-[var(--ivory-dim)]">{row.label}</p>
                <p className="mt-1 font-serif text-2xl">{summary[row.kind]}</p>
              </div>
            ))}
          </div>
          <ul className="mt-5 divide-y divide-[var(--line)]">
            {matches.map((row) => (
              <li key={row.target.id} className="flex items-center gap-3 py-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center font-serif text-sm"
                  style={{ background: row.target.accent }}
                >
                  {row.target.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.target.displayName}</p>
                  <p className="truncate text-sm text-[var(--ivory-dim)]">
                    {PRESENCE_KIND_LABELS[row.kind]}
                    {" · "}
                    {presenceLine(row.kind, row.target.city)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-5 text-[10px] tracking-[0.14em] uppercase text-[var(--ivory-dim)]">
        City-level only — never precise pins, never live location.
      </p>
    </div>
  );
}
