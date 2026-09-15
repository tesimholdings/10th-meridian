"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: "presence", title: "Presence" },
  { id: "work", title: "Work" },
  { id: "signal", title: "Signal" },
  { id: "exchange", title: "Exchange" },
  { id: "threshold", title: "Threshold" },
];

type Draft = Record<string, string>;

export function ApplyWizard({ referralCode }: { referralCode?: string | null }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    referralCode: referralCode ?? "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function set(name: string, value: string) {
    setDraft((d) => ({ ...d, [name]: value }));
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "tm-application",
        JSON.stringify({ ...draft, [name]: value }),
      );
    }
  }

  async function submit() {
    if (draft.terms !== "yes") {
      setStatus("Agree to the house standards to submit.");
      return;
    }
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(json.message ?? (json.ok ? "Received, and in human hands." : "Could not submit."));
  }

  return (
    <div>
      <p className="label">
        Step {step + 1} of {steps.length} · {steps[step].title}
      </p>
      <div className="mt-3 h-px bg-[var(--line)]">
        <div className="h-px bg-[var(--gold)]" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-8 grid gap-4">
        {step === 0 ? (
          <>
            <Field label="Name" name="fullName" value={draft.fullName} onChange={set} required />
            <Field label="Email" name="email" type="email" value={draft.email} onChange={set} required />
            <Field label="Phone (optional)" name="phone" value={draft.phone} onChange={set} />
            <Field label="City" name="city" value={draft.city} onChange={set} />
            <Field label="Country" name="country" value={draft.country} onChange={set} />
            <Field label="Timezone" name="timezone" value={draft.timezone} onChange={set} placeholder="America/Chicago" />
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Field label="Role" name="roleTitle" value={draft.roleTitle} onChange={set} />
            <Field label="Company / house" name="company" value={draft.company} onChange={set} />
            <Area label="A short account of your work" name="bio" value={draft.bio} onChange={set} />
            <Field label="Website (optional)" name="website" value={draft.website} onChange={set} />
            <Field label="LinkedIn (optional)" name="linkedin" value={draft.linkedin} onChange={set} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Field label="Industries" name="industries" value={draft.industries} onChange={set} placeholder="comma separated" />
            <Field label="Interests" name="interests" value={draft.interests} onChange={set} />
            <Area label="Goals" name="goals" value={draft.goals} onChange={set} />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Area label="Strengths" name="strengths" value={draft.strengths} onChange={set} />
            <Area label="What you can offer" name="offers" value={draft.offers} onChange={set} />
            <Area label="What you need" name="needs" value={draft.needs} onChange={set} />
            <Area label="People and opportunities you value" name="valued" value={draft.valued} onChange={set} />
            <Field
              label="Preferred connection types"
              name="preferredConnectionTypes"
              value={draft.preferredConnectionTypes}
              onChange={set}
              placeholder="peer, mentor, collaborator"
            />
          </>
        ) : null}
        {step === 4 ? (
          <>
            <Field label="Referral code" name="referralCode" value={draft.referralCode} onChange={set} />
            <Field label="How did you find the house?" name="discoverySource" value={draft.discoverySource} onChange={set} />
            <label className="flex items-start gap-3 text-sm text-[var(--navy-soft)]">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 min-h-5"
                checked={draft.terms === "yes"}
                onChange={(e) => set("terms", e.target.checked ? "yes" : "")}
              />
              I agree to the placeholder Terms, Privacy, and Community standards. Absolutely no soliciting. Ban with no refund. Referrals are welcome. Mention yourself only if asked. Selection is human and never guaranteed.
            </label>
          </>
        ) : null}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button variant="quiet" type="button" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              if (step === 0) {
                if (!(draft.fullName ?? "").trim() || !(draft.email ?? "").trim()) {
                  setStatus("Name and email are required.");
                  return;
                }
                if (!(draft.city ?? "").trim() || !(draft.country ?? "").trim()) {
                  setStatus("City and country are required.");
                  return;
                }
              }
              setStatus(null);
              setStep((s) => s + 1);
            }}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" className="flex-1" onClick={() => void submit()}>
            Submit application
          </Button>
        )}
      </div>
      {status ? <p className="mt-4 text-sm text-[var(--gold-dim)]">{status}</p> : null}
      <p className="mt-6 text-[12px] text-[var(--ivory-dim)]">
        Progress is held in this browser until you submit. No more than ten new members
        are hand-selected each month.
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  value?: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <textarea name={name} value={value ?? ""} onChange={(e) => onChange(name, e.target.value)} />
    </label>
  );
}
