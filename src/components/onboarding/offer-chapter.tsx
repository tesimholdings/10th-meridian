import { GuidedArea, GuidedField } from "@/components/onboarding/guided-field";
import { EXCHANGE_LEDE, INTENT_SOLICITING } from "@/lib/onboarding/copy";
import type { ExperienceDraft } from "@/lib/onboarding/draft";

export function OfferChapter({
  draft,
  onChange,
}: {
  draft: ExperienceDraft;
  onChange: (patch: Partial<ExperienceDraft>) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--navy)]">Offer & need</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--navy-soft)]">{EXCHANGE_LEDE}</p>
      <div className="mt-6 grid gap-4">
        <GuidedArea field="offers" value={draft.offers} onChange={(offers) => onChange({ offers })} />
        <GuidedArea field="needs" value={draft.needs} onChange={(needs) => onChange({ needs })} />
        <GuidedField field="strengths" value={draft.strengths} onChange={(strengths) => onChange({ strengths })} />
        <GuidedField field="industries" value={draft.industries} onChange={(industries) => onChange({ industries })} />
        <GuidedField field="interests" value={draft.interests} onChange={(interests) => onChange({ interests })} />
        <GuidedField field="goals" value={draft.goals} onChange={(goals) => onChange({ goals })} />
      </div>
      <p className="mt-5 text-sm leading-relaxed text-[var(--navy-soft)]">{INTENT_SOLICITING}</p>
    </div>
  );
}
