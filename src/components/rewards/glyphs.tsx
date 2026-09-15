import type { RewardKind } from "@/lib/rewards/types";

export function RewardGlyph({ kind }: { kind: RewardKind }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden className="text-[var(--navy)]">
      {kind === "gold" ? (
        <>
          <rect x="5" y="11" width="18" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 11 L14 7 L20 11" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      ) : null}
      {kind === "trip" ? (
        <path
          d="M5 20 C9 12 12 8 14 8 C16 8 19 12 23 20 M9 16 H19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      ) : null}
      {kind === "table" ? (
        <>
          <ellipse cx="14" cy="12" rx="8" ry="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 12 V19 M22 12 V19 M10 19 H18" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      ) : null}
      {kind === "yacht" ? (
        <path
          d="M5 17 L14 8 L23 17 H5 Z M8 17 C10 21 18 21 20 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      ) : null}
      {kind === "guest_pass" ? (
        <rect x="5" y="8" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      ) : null}
      {kind === "founders" ? (
        <circle cx="14" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      ) : null}
    </svg>
  );
}
