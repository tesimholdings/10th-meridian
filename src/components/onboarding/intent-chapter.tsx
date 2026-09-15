import { GuidedField } from "@/components/onboarding/guided-field";
import { INTENT_LEDE, INTENT_SOLICITING } from "@/lib/onboarding/copy";
import { INTENT_OTHER_ID, JOIN_INTENTS, toggleIntent } from "@/lib/onboarding/intents";

export function IntentChapter({
  selected,
  other,
  onChange,
}: {
  selected: string[];
  other: string;
  onChange: (next: { intents: string[]; intentOther: string }) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--navy)]">Why you’re here</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--navy-soft)]">{INTENT_LEDE}</p>
      <ul className="mt-6 grid gap-2">
        {JOIN_INTENTS.map((intent) => {
          const on = selected.includes(intent.id);
          return (
            <li key={intent.id}>
              <button
                type="button"
                aria-pressed={on}
                className={`intent-chip ${on ? "intent-chip-on" : ""}`}
                onClick={() => onChange({ intents: toggleIntent(selected, intent.id), intentOther: other })}
              >
                <span className="block font-medium">{intent.label}</span>
                <span className="mt-0.5 block text-[12px] text-[var(--ivory-dim)]">{intent.hint}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected.includes(INTENT_OTHER_ID) ? (
        <div className="mt-5">
          <GuidedField
            field="intentOther"
            value={other}
            onChange={(intentOther) => onChange({ intents: selected, intentOther })}
          />
        </div>
      ) : null}
      <p className="mt-5 text-sm leading-relaxed text-[var(--navy-soft)]">{INTENT_SOLICITING}</p>
    </div>
  );
}
