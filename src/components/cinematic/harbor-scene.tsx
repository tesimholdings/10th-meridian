/** Original atmosphere art — harbor daylight, yacht deck, night lights. Not stock. */

export function HarborScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 1800"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08090b" />
          <stop offset="28%" stopColor="#122033" />
          <stop offset="52%" stopColor="#1f6f96" />
          <stop offset="68%" stopColor="#4eb6d4" />
          <stop offset="100%" stopColor="#08090b" />
        </linearGradient>
        <radialGradient id="day" cx="72%" cy="36%" r="38%">
          <stop offset="0%" stopColor="#f6f4ef" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#7ec8de" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#08090b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gold-glow" cx="28%" cy="38%" r="22%">
          <stop offset="0%" stopColor="#c6a45a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c6a45a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#f6f4ef" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#c6a45a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1800" fill="url(#sky)" />
      <rect width="1200" height="1800" fill="url(#day)" />
      <rect width="1200" height="1800" fill="url(#gold-glow)" />
      <circle cx="860" cy="620" r="46" fill="#f6f4ef" opacity="0.72" />
      <circle cx="860" cy="620" r="90" fill="#c6a45a" opacity="0.12" />
      <path
        className="harbor-wave"
        d="M-40 1180 C 160 1120, 320 1240, 520 1170 S 860 1110, 1240 1190 V1800 H-40 Z"
        fill="#0f4d6b"
        opacity="0.55"
      />
      <path
        className="harbor-wave harbor-wave-2"
        d="M-40 1280 C 200 1220, 380 1360, 600 1288 S 940 1224, 1240 1300 V1800 H-40 Z"
        fill="#2d96b8"
        opacity="0.42"
      />
      <path
        className="harbor-wave harbor-wave-3"
        d="M-40 1400 C 180 1340, 420 1480, 680 1410 S 980 1350, 1240 1420 V1800 H-40 Z"
        fill="#7ec8de"
        opacity="0.22"
      />
      <g opacity="0.9">
        <path d="M210 1040 L390 1040 L430 1108 L170 1108 Z" fill="#08090b" />
        <path d="M250 980 H370 V1040 H250 Z" fill="#111214" />
        <path d="M300 860 V980" stroke="#c6a45a" strokeWidth="2" />
        <path d="M300 880 L360 980" stroke="#f6f4ef" strokeWidth="0.8" opacity="0.45" />
        <path d="M300 900 L248 980" stroke="#f6f4ef" strokeWidth="0.6" opacity="0.3" />
      </g>
      <g className="harbor-beams">
        <path d="M300 980 L120 1600 L480 1600 Z" fill="url(#beam)" opacity="0.28" />
        <path d="M300 980 L260 1600 L620 1600 Z" fill="url(#beam)" opacity="0.18" />
        <path d="M300 980 L40 1580 L220 1580 Z" fill="url(#beam)" opacity="0.14" />
      </g>
      {[
        [240, 1028],
        [280, 1022],
        [320, 1024],
        [355, 1028],
        [268, 1004],
        [330, 1000],
      ].map(([x, y], i) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={i % 2 ? 2.2 : 1.4} fill={i % 3 ? "#c6a45a" : "#f6f4ef"} />
      ))}
      <path d="M600 40 V1760" stroke="#c6a45a" strokeWidth="0.8" opacity="0.55" />
      <ellipse cx="600" cy="980" rx="420" ry="150" fill="none" stroke="#f6f4ef" opacity="0.1" />
    </svg>
  );
}
