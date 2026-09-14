import type { JourneyRecord, TravelScoredMatch } from "@/lib/crossings/types";

/** A decorative atlas, deliberately without precise member locations. */
export function CityAtlas({
  journey,
  matches,
}: {
  journey?: JourneyRecord;
  matches: TravelScoredMatch[];
}) {
  return (
    <div className="atlas-stage">
      <div className="atlas-caption">
        <p className="label">Your next horizon</p>
        <p className="mt-2 font-serif text-3xl">
          {journey?.destinationCity ?? "A world of connection"}
        </p>
        <p className="mt-2 text-sm text-ivory-muted">
          {matches.length} relevant {matches.length === 1 ? "path" : "paths"}
        </p>
      </div>
      <svg viewBox="0 0 640 320" aria-hidden="true" className="atlas-globe">
        <g fill="none" stroke="currentColor" strokeWidth=".7" opacity=".3">
          <ellipse cx="360" cy="170" rx="210" ry="135" />
          <ellipse cx="360" cy="170" rx="125" ry="135" />
          <ellipse cx="360" cy="170" rx="50" ry="135" />
          <ellipse cx="360" cy="170" rx="210" ry="42" />
          <ellipse cx="360" cy="170" rx="195" ry="92" />
          <path d="M150 170h420M360 35v270" />
        </g>
        <path
          className="atlas-route"
          d="M191 136Q302 20 420 132T530 201M262 237Q370 125 420 132"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        {[
          [191, 136],
          [420, 132],
          [530, 201],
          [262, 237],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="currentColor" />
            <circle
              className="atlas-beacon"
              style={{ animationDelay: `${i * 0.7}s` }}
              cx={x}
              cy={y}
              r="9"
              fill="none"
              stroke="currentColor"
              opacity=".3"
            />
          </g>
        ))}
      </svg>
      <p className="atlas-footnote">
        An imagined atlas · City-level presence only
      </p>
    </div>
  );
}
