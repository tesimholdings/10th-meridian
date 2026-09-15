export function ProgressRing({
  value,
  max,
  size = 72,
  label,
}: {
  value: number;
  max: number;
  size?: number;
  label?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <svg width={size} height={size} viewBox="0 0 72 72" role="img" aria-label={label}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(9,43,69,0.1)" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 36 36)"
        className="reward-ring"
      />
    </svg>
  );
}
