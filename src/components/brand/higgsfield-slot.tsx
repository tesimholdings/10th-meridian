import { EDITORIAL_CAPTION, EDITORIAL_CREDIT } from "@/lib/atmosphere/campaign";

/** Editorial frame. Never claims the still depicts real members or a completed event. */

export function HiggsfieldSlot({
  src,
  alt = "",
  caption = EDITORIAL_CAPTION,
  className = "",
  aspect = "aspect-[16/10]",
  credit = EDITORIAL_CREDIT,
}: {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
  aspect?: string;
  credit?: string;
}) {
  return (
    <figure className={`media-slot overflow-hidden ${className}`} data-higgsfield="editorial">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={`${aspect} w-full object-cover`} />
      <figcaption className="sr-only">{caption}</figcaption>
      {credit ? (
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--ivory-dim)]">{credit}</p>
      ) : null}
    </figure>
  );
}
