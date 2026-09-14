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
    <div className="atlas atlas-grid relative overflow-hidden border border-[rgba(198,164,90,0.36)]">
      <svg viewBox="0 0 100 80" className="h-56 w-full md:h-72" aria-hidden>
        <path
          d="M18 36 C 22 30, 30 28, 36 33 C 40 28, 48 30, 52 36 C 46 44, 32 46, 22 42 Z"
          fill="rgba(31,127,160,0.32)"
        />
        <path
          d="M48 28 C 54 24, 62 26, 64 34 C 60 42, 52 40, 48 36 Z"
          fill="rgba(45,150,184,0.24)"
        />
        <path
          d="M66 40 C 74 36, 82 40, 86 46 C 80 54, 70 52, 66 48 Z"
          fill="rgba(31,127,160,0.22)"
        />
        <path
          d="M50 50 C 56 48, 60 54, 58 62 C 52 66, 48 60, 50 54 Z"
          fill="rgba(45,150,184,0.18)"
        />
        {[20, 35, 50, 65].map((y) => (
          <line
            key={`p-${y}`}
            x1="6"
            y1={y}
            x2="94"
            y2={y}
            stroke="rgba(239,230,212,0.08)"
            strokeWidth="0.15"
          />
        ))}
        {[25, 40, 60, 75].map((x) => (
          <line
            key={`m-${x}`}
            x1={x}
            y1="10"
            x2={x}
            y2="72"
            stroke="rgba(239,230,212,0.07)"
            strokeWidth="0.15"
          />
        ))}
        <line x1="50" y1="6" x2="50" y2="74" stroke="rgba(198,164,90,0.5)" strokeWidth="0.28" />
        <text x="51.6" y="11" fill="#c6a45a" fontSize="2.8" letterSpacing="0.28">
          10°
        </text>
        {MARKS.map((m) => {
          const on = active.has(m.city);
          const dest = m.city === crossingCity;
          return (
            <g key={m.city}>
              {dest ? (
                <circle
                  cx={m.x}
                  cy={m.y}
                  r="3.4"
                  fill="none"
                  stroke="#c6a45a"
                  strokeWidth="0.28"
                  className="meridian-pulse"
                />
              ) : null}
              <path
                d={`M${m.x - 1.1} ${m.y} H${m.x + 1.1} M${m.x} ${m.y - 1.1} V${m.y + 1.1}`}
                stroke={dest ? "#c6a45a" : on ? "#7ec8de" : "rgba(246,244,239,0.3)"}
                strokeWidth={dest ? 0.45 : 0.28}
              />
              <text
                x={m.x + 2}
                y={m.y + 0.9}
                fill={on ? "#f6f4ef" : "#9c978c"}
                fontSize="2.5"
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
