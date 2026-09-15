import { GuidedArea, GuidedField } from "@/components/onboarding/guided-field";
import type { ExperienceDraft } from "@/lib/onboarding/draft";
import type { ExperienceMode } from "@/lib/onboarding/copy";

export function IdentityChapter({
  mode,
  draft,
  onChange,
}: {
  mode: ExperienceMode;
  draft: ExperienceDraft;
  onChange: (patch: Partial<ExperienceDraft>) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--navy)]">Who you are</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--navy-soft)]">
        A portrait, not a résumé. City and role are enough to begin.
      </p>
      <div className="mt-6 grid gap-4">
        {mode === "apply" ? (
          <>
            <GuidedField field="fullName" required value={draft.fullName} onChange={(fullName) => onChange({ fullName, displayName: fullName })} />
            <GuidedField field="email" type="email" required value={draft.email} onChange={(email) => onChange({ email })} />
            <GuidedField field="phone" type="tel" value={draft.phone} onChange={(phone) => onChange({ phone })} />
          </>
        ) : (
          <>
            <GuidedField field="displayName" required value={draft.displayName} onChange={(displayName) => onChange({ displayName, fullName: displayName })} />
            <GuidedField field="headline" value={draft.headline} onChange={(headline) => onChange({ headline })} />
          </>
        )}
        <GuidedField field="city" required value={draft.city} onChange={(city) => onChange({ city })} />
        <GuidedField field="country" required value={draft.country} onChange={(country) => onChange({ country })} />
        <GuidedField field="timezone" value={draft.timezone} onChange={(timezone) => onChange({ timezone })} />
        <GuidedField field="roleTitle" required value={draft.roleTitle} onChange={(roleTitle) => onChange({ roleTitle })} />
        <GuidedField field="company" value={draft.company} onChange={(company) => onChange({ company })} />
        <GuidedArea field="bio" value={draft.bio} onChange={(bio) => onChange({ bio })} />
      </div>
    </div>
  );
}
