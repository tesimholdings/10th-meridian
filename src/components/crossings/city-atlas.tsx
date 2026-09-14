import type { JourneyRecord, TravelScoredMatch } from "@/lib/crossings/types";

const MARKS: { city: string; x: number; y: number }[] = [
  { city: "Chicago", x: 28, y: 42 },
  { city: "New York", x: 36, y: 40 },
  { city: "Mexico City", x: 24, y: 58 },
  { city: "London", x: 50, y: 34 },
  { city: "Paris", x: 52, y: 38 },
  { city: "Lagos", x: 54, y: 62 },
  { city: "Mumbai", x: 70, y: 55 },
  { city: "Singapore", x: 78, y: 66 },
  { city: "Kyoto", x: 84, y: 44 },
  { city: "Stockholm", x: 56, y: 26 },
];

export function CityAtlas({
  journey,
  matches,
}: {
  journey?: JourneyRecord;
  matches: TravelScoredMatch[];
}) {
  const active = new Set(
    [journey?.destinationCity, ...matches.map((m) => m.target.city)].filter(Boolean),
  );
  const crossingCity = journey?.destinationCity;

  return (
    <div className="atlas atlas-grid relative overflow-hidden border border-[var(--line)]">
      <svg viewBox="0 0 100 80" className="h-56 w-full md:h-72" aria-hidden>
        <line x1="50" y1="4" x2="50" y2="76" stroke="rgba(176,141,74,0.35)" strokeWidth="0.3" />
        <text x="51.5" y="8" fill="#b08d4a" fontSize="3" letterSpacing="0.3">
          10°
        </text>
        {MARKS.map((m) => {
          const on = active.has(m.city);
          const dest = m.city === crossingCity;
          return (
            <g key={m.city}>
              <circle
                cx={m.x}
                cy={m.y}
                r={dest ? 2.2 : on ? 1.6 : 1}
                fill={dest ? "#b08d4a" : on ? "#c9bfa8" : "rgba(239,230,212,0.25)"}
                className={dest ? "meridian-pulse" : undefined}
              />
              <text
                x={m.x + 2.2}
                y={m.y + 1}
                fill={on ? "#efe6d4" : "#8f8774"}
                fontSize="2.6"
              >
                {m.city}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="absolute bottom-2 left-3 right-3 text-[10px] tracking-[0.16em] uppercase text-ivory-dim">
        An atlas of presence — never precise pins, never live location.
      </p>
    </div>
  );
}
