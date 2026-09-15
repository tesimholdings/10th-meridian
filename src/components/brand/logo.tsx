import { MeridianMark } from "@/components/brand/mark";
import {
  FORMAL_LOCKUP_KNOCKOUT_SRC,
  FORMAL_LOCKUP_KNOCKOUT_WEBP,
  FORMAL_LOCKUP_SRC,
  FORMAL_LOCKUP_WEBP,
} from "@/lib/copy/open-house";

export function Wordmark({
  compact = false,
  surface = "dark",
}: {
  compact?: boolean;
  /** dark = ivory/white type for grain and hero; light = navy type for paper. Never a black raster on white. */
  surface?: "dark" | "light";
}) {
  const onDark = surface === "dark";

  return (
    <div
      className={`flex items-center gap-2.5 ${onDark ? "text-[#faf8f2]" : "text-[#092b45]"}`}
    >
      <MeridianMark className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <p
        className={`font-serif leading-none tracking-tight ${
          compact ? "text-[1.35rem]" : "text-[1.55rem] md:text-3xl"
        }`}
      >
        10th Meridian
      </p>
    </div>
  );
}

/** Official formal lockup — gold globe + TENTH MERIDIAN. Black plate only on dark surfaces. */
export function FormalLockup({
  className = "h-14 w-auto max-w-[min(100%,22rem)]",
  knockout = false,
}: {
  className?: string;
  /** Transparent crop for photography / hero. Never use the black plate on paper. */
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
