import { MeridianMark } from "@/components/brand/mark";
import { brand } from "@/lib/config/site";

export function ReferralCard({
  code,
  qrSrc,
}: {
  code: string;
  qrSrc: string;
}) {
  return (
    <article className="referral-card-sheet relative overflow-hidden text-ivory" style={{ aspectRatio: "7.5 / 4.25" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 90% at 88% 110%, rgba(45,150,184,0.42), transparent 58%), radial-gradient(50% 70% at 8% 0%, rgba(126,200,222,0.16), transparent 50%), linear-gradient(160deg, #08090b 0%, #0f4d6b 72%, #0a1218 100%)",
        }}
      />
      <div className="absolute inset-0 grain opacity-40" />
      <div className="absolute left-[8%] top-0 h-full w-px bg-[var(--gold)]/45" />
      <div className="relative grid h-full grid-cols-[1.35fr_0.85fr] gap-4 p-[6%]">
        <div className="flex min-w-0 flex-col justify-between">
          <div className="flex items-center gap-3">
            <MeridianMark className="h-10 w-10" />
            <div>
              <p className="label !text-[0.48rem]">Longitude 10</p>
              <p className="font-serif text-2xl leading-none tracking-tight sm:text-3xl">{brand.name}</p>
            </div>
          </div>
          <div>
            <p className="label">A door, slightly earlier</p>
            <p className="mt-2 font-serif text-[1.65rem] leading-[0.95] sm:text-4xl">{code}</p>
            <p className="mt-3 max-w-[16rem] text-[11px] leading-relaxed text-ivory-muted">
              {brand.referralTone}
            </p>
          </div>
          <p className="text-[10px] tracking-[0.18em] uppercase text-ivory-dim">
            Invitation only · The tenth
          </p>
        </div>
        <div className="flex flex-col items-end justify-between">
          <p className="text-right text-[10px] tracking-[0.2em] uppercase text-gold">Scan to enter</p>
          <div className="w-[min(100%,9.5rem)] border border-[var(--gold)]/50 bg-[var(--ivory)] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={`QR for referral ${code}`} className="aspect-square w-full" />
          </div>
          <p className="text-right text-[10px] tracking-[0.16em] uppercase text-ivory-dim">
            tenmeridian.com
          </p>
        </div>
      </div>
    </article>
  );
}
