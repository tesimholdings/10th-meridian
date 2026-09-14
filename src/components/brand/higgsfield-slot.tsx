/** Placeholder frame for Higgsfield / licensed stills. Never claims AI depicts real members. */

export function HiggsfieldSlot({
  src,
  alt,
  caption,
  className = "",
  aspect = "aspect-[16/10]",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <figure className={`media-slot overflow-hidden ${className}`} data-higgsfield="pending">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={`${aspect} w-full object-cover`} />
      {caption ? <figcaption className="sr-only">{caption}</figcaption> : null}
    </figure>
  );
}
