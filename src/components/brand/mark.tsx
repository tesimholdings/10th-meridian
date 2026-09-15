export function MeridianMark({
  className = "h-16 w-16",
  title = "10th Meridian mark",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <g fill="none" stroke="#c4a264" strokeLinecap="round">
        <circle cx="40" cy="40" r="28.5" strokeWidth="1.35" />
        <ellipse
          cx="40"
          cy="40"
          rx="28.5"
          ry="10.8"
          transform="rotate(-48 40 40)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="28.5"
          ry="10.8"
          transform="rotate(48 40 40)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="28.5"
          ry="7.2"
          strokeWidth="0.7"
          strokeDasharray="0.9 2.4"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="24.5"
          ry="18.5"
          strokeWidth="0.55"
          strokeDasharray="0.7 2.2"
          opacity="0.85"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="18"
          ry="25.2"
          strokeWidth="0.45"
          strokeDasharray="0.6 2.1"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
