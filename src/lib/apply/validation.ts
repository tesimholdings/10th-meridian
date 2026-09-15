/** Application-step validation. Identity is required; later chapters are optional. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ApplyDraft = Record<string, string | undefined>;

export function validatePresence(draft: ApplyDraft): string | null {
  if (!(draft.fullName ?? "").trim()) return "Name is required.";
  if (!(draft.email ?? "").trim()) return "Email is required.";
  if (!EMAIL.test((draft.email ?? "").trim())) return "Enter a valid email.";
  if (!(draft.city ?? "").trim() || !(draft.country ?? "").trim()) {
    return "City and country are required.";
  }
  return null;
}

export function validateThreshold(draft: ApplyDraft): string | null {
  if (draft.terms !== "yes") return "Agree to the house standards to submit.";
  return null;
}

export function validateApplication(draft: ApplyDraft): string | null {
  return validatePresence(draft) ?? validateThreshold(draft);
}

export function isOptionalApplyStep(step: number): boolean {
  return step === 1 || step === 2 || step === 3;
}

export function applySummary(draft: ApplyDraft): { label: string; value: string; step: number }[] {
  const row = (label: string, value: string | undefined, step: number) => ({
    label,
    value: (value ?? "").trim() || "Not given",
    step,
  });
  return [
    row("Name", draft.fullName, 0),
    row("Email", draft.email, 0),
    row("City", draft.city, 0),
    row("Country", draft.country, 0),
    row("Role", draft.roleTitle, 1),
    row("Company", draft.company, 1),
    row("Industries", draft.industries, 2),
    row("Offers", draft.offers, 3),
    row("Needs", draft.needs, 3),
  ];
}
