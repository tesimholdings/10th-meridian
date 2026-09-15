import {
  FORMAL_LOCKUP_KNOCKOUT_SRC,
  FORMAL_LOCKUP_KNOCKOUT_WEBP,
  FORMAL_LOCKUP_SRC,
  FORMAL_LOCKUP_WEBP,
} from "@/lib/copy/open-house";

/** Chrome height for the official lockup (gold globe + TENTH MERIDIAN + rule + PRIVATE NETWORK). */
export const LOCKUP_CHROME_CLASS =
  "h-8 w-auto max-w-[min(58vw,13.75rem)] md:h-9 md:max-w-[17rem]";

/** Official formal lockup — same asset as the closed lock. Knockout (no black plate) on chrome. */
export function FormalLockup({
  className = "h-14 w-auto max-w-[min(100%,22rem)]",
  knockout = true,
}: {
  className?: string;
  /** Transparent crop. Never put the black plate on glass, paper, or photography. */
  knockout?: boolean;
}) {
  const png = knockout ? FORMAL_LOCKUP_KNOCKOUT_SRC : FORMAL_LOCKUP_SRC;
  const webp = knockout ? FORMAL_LOCKUP_KNOCKOUT_WEBP : FORMAL_LOCKUP_WEBP;

  return (
    <picture>
      <source type="image/webp" srcSet={webp} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={png}
        alt="Tenth Meridian — Private Network, established MMXXVI"
        className={className}
      />
    </picture>
  );
}

/**
 * House chrome mark. Always the official lockup (not “10th Meridian” + approximate globe).
 * `surface` is accepted for call-site compatibility; type color lives in the knockout asset.
 */
export function Wordmark({
  compact = false,
  surface: _surface = "dark",
}: {
  compact?: boolean;
  surface?: "dark" | "light";
}) {
  return (
    <FormalLockup
      knockout
      className={
        compact
          ? LOCKUP_CHROME_CLASS
          : "h-10 w-auto max-w-[min(80vw,20rem)] md:h-12 md:max-w-[24rem]"
      }
    />
  );
}
