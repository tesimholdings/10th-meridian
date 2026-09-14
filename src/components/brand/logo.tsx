import { MeridianMark } from "@/components/brand/mark";

export function Wordmark({
  compact = false,
  light = true,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${light ? "text-ivory" : "text-void"}`}>
      <MeridianMark className={compact ? "h-9 w-9" : "h-12 w-12"} />
      <div className="leading-none">
        <p className="label !text-[0.58rem]">{compact ? "Private network" : "Longitude 10"}</p>
        <p className="font-serif text-[1.55rem] tracking-tight md:text-3xl">
          10th Meridian
        </p>
      </div>
    </div>
  );
}
