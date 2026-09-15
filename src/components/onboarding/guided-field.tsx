import { fieldGuide, type FieldGuideKey } from "@/lib/onboarding/fields";

export function GuidedField({
  field,
  value,
  onChange,
  type = "text",
  required,
  name,
}: {
  field: FieldGuideKey;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  name?: string;
}) {
  const guide = fieldGuide(field);
  return (
    <label className="grid gap-1.5">
      <span className="label">
        {guide.label}
        {required ? <span className="ml-1 text-[var(--gold)]">·</span> : null}
      </span>
      <input
        name={name ?? field}
        type={type}
        required={required}
        value={value ?? ""}
        placeholder={guide.placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={field === "email" ? "email" : field === "fullName" || field === "displayName" ? "name" : undefined}
      />
      <span className="text-[12px] leading-relaxed text-[var(--ivory-dim)]">{guide.helper}</span>
    </label>
  );
}

export function GuidedArea({
  field,
  value,
  onChange,
  name,
}: {
  field: FieldGuideKey;
  value?: string;
  onChange: (value: string) => void;
  name?: string;
}) {
  const guide = fieldGuide(field);
  return (
    <label className="grid gap-1.5">
      <span className="label">{guide.label}</span>
      <textarea
        name={name ?? field}
        value={value ?? ""}
        placeholder={guide.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="text-[12px] leading-relaxed text-[var(--ivory-dim)]">{guide.helper}</span>
    </label>
  );
}
