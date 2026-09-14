import Image from "next/image";

export function HeroStage({
  children,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  return (
    <div className="hero-stage relative min-h-dvh overflow-hidden text-ivory">
      <div className="hero-image absolute inset-0" aria-hidden="true">
        <Image
          src="/media/meridian-night.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="hero-shade absolute inset-0" />
      <div className="orbital-field" aria-hidden="true">
        <span />
        <span />
        <i />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
