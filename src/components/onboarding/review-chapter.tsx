import { GuidedField } from "@/components/onboarding/guided-field";
import { INTENT_SOLICITING } from "@/lib/onboarding/copy";
import { intentLabels } from "@/lib/onboarding/intents";
import { SOCIAL_CATALOG } from "@/lib/onboarding/socials";
import type { ExperienceDraft } from "@/lib/onboarding/draft";
import type { ExperienceMode } from "@/lib/onboarding/copy";

export function ReviewChapter({
  mode,
  draft,
  onChange,
}: {
  mode: ExperienceMode;
  draft: ExperienceDraft;
  onChange: (patch: Partial<ExperienceDraft>) => void;
}) {
  const name = mode === "apply" ? draft.fullName : draft.displayName;
  const connected = draft.socials.filter((row) => row.connected);

  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--navy)]">
        {mode === "apply" ? "Ready for human hands" : "The portrait, as it stands"}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--navy-soft)]">
        {mode === "apply"
          ? "Selection is discretionary. Completeness helps. Nothing here guarantees a place."
          : "Continue into the member house when this feels true. You can refine it later."}
      </p>
      <dl className="mt-6 grid gap-4 text-sm">
        <Row label="Name" value={name} />
        {mode === "apply" ? <Row label="Email" value={draft.email} /> : null}
        <Row label="City" value={[draft.city, draft.country].filter(Boolean).join(", ")} />
        <Row label="Role" value={[draft.roleTitle, draft.company].filter(Boolean).join(" · ")} />
        <Row label="Why you’re here" value={intentLabels(draft.intents, draft.intentOther).join(" · ")} />
        <Row
          label="Connected"
          value={
            connected.length
              ? connected
                  .map((row) => SOCIAL_CATALOG.find((item) => item.id === row.provider)?.label ?? row.provider)
                  .join(" · ")
              : "None yet — optional"
          }
        />
        <Row label="You can help with" value={draft.offers} />
        <Row label="You need" value={draft.needs} />
      </dl>
      {mode === "apply" ? (
        <div className="mt-6 grid gap-4">
          <GuidedField field="referralCode" value={draft.referralCode} onChange={(referralCode) => onChange({ referralCode })} />
          <GuidedField
            field="discoverySource"
            value={draft.discoverySource}
            onChange={(discoverySource) => onChange({ discoverySource })}
          />
          <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--navy-soft)]">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 min-h-5"
              checked={draft.terms === "yes"}
              onChange={(e) => onChange({ terms: e.target.checked ? "yes" : "" })}
            />
            I agree to the placeholder Terms, Privacy, and Community standards. {INTENT_SOLICITING}{" "}
            Lifetime membership is $10,000. No more than ten new members are hand-selected each month.
          </label>
        </div>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-[var(--navy-soft)]">{INTENT_SOLICITING}</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--line)] pb-3">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-[var(--navy)]">{value || "—"}</dd>
    </div>
  );
}
