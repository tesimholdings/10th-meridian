export function MeridianMark({
  className = "h-16 w-16",
  title = "10th Meridian mark",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <circle cx="48" cy="48" r="46" fill="none" stroke="#b08d4a" strokeWidth="0.6" opacity="0.7" />
      <circle cx="48" cy="48" r="34" fill="none" stroke="#efe6d4" strokeWidth="0.4" opacity="0.28" />
      <circle cx="48" cy="48" r="18" fill="none" stroke="#b08d4a" strokeWidth="0.5" opacity="0.55" />
      <ellipse cx="48" cy="48" rx="46" ry="16" fill="none" stroke="#efe6d4" strokeWidth="0.35" opacity="0.25" />
      <ellipse cx="48" cy="48" rx="16" ry="46" fill="none" stroke="#efe6d4" strokeWidth="0.35" opacity="0.25" />
      <path d="M48 4 V92" stroke="#b08d4a" strokeWidth="1.1" />
      <path d="M4 48 H92" stroke="#efe6d4" strokeWidth="0.4" opacity="0.35" />
      <path d="M48 14 L51.2 26.5 H48 L44.8 26.5 Z" fill="#b08d4a" />
      <circle cx="48" cy="48" r="2.2" fill="#efe6d4" />
      <path d="M62 18 L64 22" stroke="#efe6d4" strokeWidth="0.5" opacity="0.45" />
      <path d="M30 70 L28 75" stroke="#efe6d4" strokeWidth="0.5" opacity="0.35" />
    </svg>
  );
}
