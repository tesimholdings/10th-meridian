import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/site";
import { welcomeCopy, type ExperienceMode } from "@/lib/onboarding/copy";

export function WelcomeChapter({
  mode,
  onBegin,
}: {
  mode: ExperienceMode;
  onBegin: () => void;
}) {
  const copy = welcomeCopy(mode);
  return (
    <div>
      <p className="text-[0.72rem] font-medium tracking-[0.18em] text-[var(--gold-dim)]">
        {copy.eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-[0.96] text-[var(--navy)] md:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--navy-soft)]">{copy.lede}</p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--ivory-dim)]">{copy.facts}</p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--navy-soft)]">{brand.solicitingLine}</p>
      <div className="mt-8">
        <Button className="w-full" onClick={onBegin}>
          Begin
        </Button>
      </div>
    </div>
  );
}
