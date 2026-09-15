/**
 * Official lockup: gold globe + TENTH MERIDIAN lives only in the art.
 * Use on black / grain. Never place the black-plate PNG on warm-white chrome.
 */
export function OfficialLockup({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      <source srcSet="/brand/tenth-meridian-logo-full-lockup-transparent.webp" type="image/webp" />
      <img
        src="/brand/tenth-meridian-logo-full-lockup-transparent.png"
        alt="10th Meridian"
        className={className}
        width={1200}
        height={360}
        decoding={priority ? "sync" : "async"}
      />
    </picture>
  );
}
