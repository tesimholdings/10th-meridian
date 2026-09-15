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
      <g fill="none" stroke="#c4a264" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="40" r="26" strokeWidth="1.45" />
        <path d="M40 14 V66" strokeWidth="1.2" />
        <ellipse
          cx="40"
          cy="40"
          rx="26"
          ry="10.2"
          transform="rotate(-48 40 40)"
          strokeWidth="1.25"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="26"
          ry="10.2"
          transform="rotate(48 40 40)"
          strokeWidth="1.25"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="26"
          ry="7.4"
          strokeWidth="0.7"
          strokeDasharray="0.85 2.3"
        />
        <ellipse
          cx="40"
          cy="40"
          rx="20.5"
          ry="20"
          strokeWidth="0.45"
          strokeDasharray="0.55 2"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}
