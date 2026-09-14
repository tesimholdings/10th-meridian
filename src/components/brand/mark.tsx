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
      <circle cx="48" cy="48" r="46" fill="none" stroke="#c6a45a" strokeWidth="0.6" opacity="0.75" />
      <circle cx="48" cy="48" r="34" fill="none" stroke="#7ec8de" strokeWidth="0.4" opacity="0.35" />
      <circle cx="48" cy="48" r="18" fill="none" stroke="#c6a45a" strokeWidth="0.5" opacity="0.6" />
      <ellipse cx="48" cy="48" rx="46" ry="16" fill="none" stroke="#f6f4ef" strokeWidth="0.35" opacity="0.28" />
      <ellipse cx="48" cy="48" rx="16" ry="46" fill="none" stroke="#f6f4ef" strokeWidth="0.35" opacity="0.28" />
      <path d="M48 4 V92" stroke="#c6a45a" strokeWidth="1.1" />
      <path d="M4 48 H92" stroke="#f6f4ef" strokeWidth="0.4" opacity="0.4" />
      <path d="M48 14 L51.2 26.5 H48 L44.8 26.5 Z" fill="#c6a45a" />
      <circle cx="48" cy="48" r="2.2" fill="#f6f4ef" />
      <path d="M62 18 L64 22" stroke="#7ec8de" strokeWidth="0.5" opacity="0.55" />
      <path d="M30 70 L28 75" stroke="#f6f4ef" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
