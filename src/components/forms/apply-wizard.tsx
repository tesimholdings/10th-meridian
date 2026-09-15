"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applySummary,
  isOptionalApplyStep,
  validateApplication,
  validatePresence,
  type ApplyDraft,
} from "@/lib/apply/validation";
import { captureRouteError } from "@/lib/sentry/capture";

const steps = [
  { id: "presence", title: "Presence" },
  { id: "work", title: "Work" },
  { id: "signal", title: "Signal" },
  { id: "exchange", title: "Exchange" },
  { id: "threshold", title: "Threshold" },
];

export function ApplyWizard({ referralCode }: { referralCode?: string | null }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ApplyDraft>({
    referralCode: referralCode ?? "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const summary = useMemo(() => applySummary(draft), [draft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("tm-application");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ApplyDraft;
      setDraft((d) => ({ ...parsed, ...d, referralCode: d.referralCode || parsed.referralCode }));
    } catch {
      /* ignore */
    }
  }, []);

  function set(name: string, value: string) {
    setDraft((d) => {
      const next = { ...d, [name]: value };
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("tm-application", JSON.stringify(next));
      }
      return next;
    });
  }

  function continueFrom(current: number) {
    if (current === 0) {
      const error = validatePresence(draft);
      if (error) {
        setStatus(error);
        return;
      }
    }
    setStatus(null);
    setStep((s) => s + 1);
  }

  async function submit() {
    const error = validateApplication(draft);
    if (error) {
      setStatus(error);
      if (validatePresence(draft)) setStep(0);
      return;
    }
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(json.message ?? (json.ok ? "Received, and in human hands." : "Could not submit."));
    } catch (error) {
      captureRouteError(error, { route: "apply" });
      setStatus("Could not submit.");
    }
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
            <Field label="City" name="city" value={draft.city} onChange={set} required />
            <Field label="Country" name="country" value={draft.country} onChange={set} required />
            <Field
              label="Timezone (optional)"
              name="timezone"
              value={draft.timezone}
              onChange={set}
              placeholder="America/Chicago"
            />
          </>
        ) : null}
        {step === 1 ? (
          <>
            <p className="text-sm text-[var(--ivory-dim)]">Optional. Skip if you would rather tell this later.</p>
            <Field label="Role" name="roleTitle" value={draft.roleTitle} onChange={set} />
            <Field label="Company / house" name="company" value={draft.company} onChange={set} />
            <Area label="A short account of your work" name="bio" value={draft.bio} onChange={set} />
            <Field label="Website (optional)" name="website" value={draft.website} onChange={set} />
            <Field label="LinkedIn (optional)" name="linkedin" value={draft.linkedin} onChange={set} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <p className="text-sm text-[var(--ivory-dim)]">Optional. Skip to continue without industries or goals.</p>
            <Field
              label="Industries"
              name="industries"
              value={draft.industries}
              onChange={set}
              placeholder="comma separated"
            />
            <Field label="Interests" name="interests" value={draft.interests} onChange={set} />
            <Area label="Goals" name="goals" value={draft.goals} onChange={set} />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <p className="text-sm text-[var(--ivory-dim)]">Optional. Skip if you prefer a shorter application.</p>
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
            <section className="grid gap-2 rounded-2xl border border-[var(--line)] p-4">
              <p className="label">Review</p>
              <p className="text-sm text-[var(--ivory-dim)]">Edit any line to return to that chapter.</p>
              <dl className="mt-2 grid gap-2">
                {summary.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3">
                    <div>
                      <dt className="text-xs text-[var(--ivory-dim)]">{row.label}</dt>
                      <dd className="text-sm">{row.value}</dd>
                    </div>
                    <button
                      type="button"
                      className="min-h-11 text-sm text-[var(--blue)]"
                      onClick={() => setStep(row.step)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </dl>
            </section>
            <Field label="Referral code" name="referralCode" value={draft.referralCode} onChange={set} />
            <Field
              label="How did you find the house?"
              name="discoverySource"
              value={draft.discoverySource}
              onChange={set}
            />
            <label className="flex items-start gap-3 text-sm text-[var(--navy-soft)]">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 min-h-5"
                checked={draft.terms === "yes"}
                onChange={(e) => set("terms", e.target.checked ? "yes" : "")}
              />
              I agree to the placeholder Terms, Privacy, and Community standards. Absolutely no soliciting. Ban with no
              refund. Referrals are welcome. Mention yourself only if asked. Selection is human and never guaranteed.
            </label>
          </>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 0 ? (
          <Button variant="quiet" type="button" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <>
            {isOptionalApplyStep(step) ? (
              <Button variant="quiet" type="button" className="flex-1" onClick={() => continueFrom(step)}>
                Skip
              </Button>
            ) : null}
            <Button type="button" className="flex-1" onClick={() => continueFrom(step)}>
              Continue
            </Button>
          </>
        ) : (
          <Button type="button" className="flex-1" onClick={() => void submit()}>
            Submit application
          </Button>
        )}
      </div>
      {status ? <p className="mt-4 text-sm text-[var(--gold-dim)]">{status}</p> : null}
      <p className="mt-6 text-[12px] text-[var(--ivory-dim)]">
        Progress is held in this browser until you submit. No more than ten new members are hand-selected each month.
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
      <span className="label">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        aria-required={required || undefined}
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
