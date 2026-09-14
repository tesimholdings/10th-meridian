"use client";

import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: "presence", title: "Presence" },
  { id: "work", title: "Work" },
  { id: "signal", title: "Signal" },
  { id: "exchange", title: "Exchange" },
  { id: "threshold", title: "Threshold" },
];

type Draft = Record<string, string>;

export function ApplyWizard({
  referralCode,
}: {
  referralCode?: string | null;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const sending = useRef(false);
  const heading = useRef<HTMLParagraphElement>(null);
  const previousStep = useRef(0);
  const [draft, setDraft] = useState<Draft>({
    referralCode: referralCode ?? "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("tm-application") ?? "null",
        );
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
          setDraft(
            Object.fromEntries(
              Object.entries(saved).filter(
                ([, value]) => typeof value === "string",
              ),
            ) as Draft,
          );
          setStatus("Your application draft has been restored.");
        }
      } catch {
        /* Storage is optional; the form still works when blocked. */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);

  function set(name: string, value: string) {
    setDraft((d) => ({ ...d, [name]: value }));
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "tm-application",
          JSON.stringify({ ...draft, [name]: value }),
        );
      } catch {
        /* Keep the current draft in memory. */
      }
    }
  }

  async function submit() {
    if (sending.current || complete) return;
    sending.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setStatus(
          json.message ??
            "We couldn’t submit your application. Please try again.",
        );
        return;
      }
      setStatus(json.message ?? "Received, and in human hands.");
      setComplete(true);
      try {
        sessionStorage.removeItem("tm-application");
      } catch {
        /* Optional storage. */
      }
    } catch {
      setStatus(
        "Connection interrupted. Your answers are still here. Please try again.",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (complete)
    return (
      <section role="status" className="form-step">
        <p className="label">Application received</p>
        <h2 className="mt-4 font-serif text-4xl">Now, in human hands.</h2>
        <p className="mt-5 text-ivory-muted">{status}</p>
        <Link href="/" className="quiet-link mt-6 text-gold">
          Return to the house →
        </Link>
      </section>
    );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (step < steps.length - 1) {
          setStatus(null);
          setStep((s) => s + 1);
        } else void submit();
      }}
      aria-busy={busy}
    >
      <p ref={heading} tabIndex={-1} className="form-step-title label">
        Step {step + 1} of {steps.length} · {steps[step].title}
      </p>
      <div className="mt-3 h-px bg-[var(--line)]">
        <div
          className="form-progress bg-[var(--gold)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={step} className="form-step mt-8 grid gap-5">
        {step === 0 ? (
          <>
            <Field
              label="Name"
              name="fullName"
              value={draft.fullName}
              onChange={set}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={draft.email}
              onChange={set}
              required
            />
            <Field
              label="Phone (optional)"
              name="phone"
              value={draft.phone}
              onChange={set}
            />
            <Field label="City" name="city" value={draft.city} onChange={set} />
            <Field
              label="Country"
              name="country"
              value={draft.country}
              onChange={set}
            />
            <Field
              label="Timezone"
              name="timezone"
              value={draft.timezone}
              onChange={set}
              placeholder="America/Chicago"
            />
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Field
              label="Role"
              name="roleTitle"
              value={draft.roleTitle}
              onChange={set}
            />
            <Field
              label="Company / house"
              name="company"
              value={draft.company}
              onChange={set}
            />
            <Area
              label="A short account of your work"
              name="bio"
              value={draft.bio}
              onChange={set}
            />
            <Field
              label="Website (optional)"
              name="website"
              value={draft.website}
              onChange={set}
            />
            <Field
              label="LinkedIn (optional)"
              name="linkedin"
              value={draft.linkedin}
              onChange={set}
            />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Field
              label="Industries"
              name="industries"
              value={draft.industries}
              onChange={set}
              placeholder="comma separated"
            />
            <Field
              label="Interests"
              name="interests"
              value={draft.interests}
              onChange={set}
            />
            <Area
              label="Goals"
              name="goals"
              value={draft.goals}
              onChange={set}
            />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Area
              label="Strengths"
              name="strengths"
              value={draft.strengths}
              onChange={set}
            />
            <Area
              label="What you can offer"
              name="offers"
              value={draft.offers}
              onChange={set}
            />
            <Area
              label="What you need"
              name="needs"
              value={draft.needs}
              onChange={set}
            />
            <Area
              label="People and opportunities you value"
              name="valued"
              value={draft.valued}
              onChange={set}
            />
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
            <div className="editorial-row">
              <p className="label">Your introduction</p>
              <p className="mt-2 font-serif text-3xl">{draft.fullName}</p>
              <p className="mt-2 text-sm text-ivory-muted">{draft.email}</p>
              <p className="text-sm text-ivory-muted">
                {[draft.roleTitle, draft.company, draft.city]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <button
                type="button"
                className="quiet-link text-gold"
                onClick={() => setStep(0)}
              >
                Review your details →
              </button>
            </div>
            <Field
              label="Referral code"
              name="referralCode"
              value={draft.referralCode}
              onChange={set}
            />
            <Field
              label="How did you find the house?"
              name="discoverySource"
              value={draft.discoverySource}
              onChange={set}
            />
            <label className="flex items-start gap-3 text-sm text-ivory-muted">
              <input
                type="checkbox"
                required
                className="mt-1 h-5 w-5 min-h-5"
                checked={draft.terms === "yes"}
                onChange={(e) => set("terms", e.target.checked ? "yes" : "")}
              />
              I agree to the placeholder Terms, Privacy, and Community
              standards, and I understand selection is human and never
              guaranteed.
            </label>
          </>
        ) : null}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button
            variant="ghost"
            type="button"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button type="submit" className="flex-1" disabled={busy}>
            Continue
          </Button>
        ) : (
          <Button type="submit" className="flex-1" disabled={busy || complete}>
            {busy
              ? "Sending application…"
              : complete
                ? "Application received"
                : "Submit application"}
          </Button>
        )}
      </div>
      {status ? (
        <p role="status" className="status-message mt-4 text-sm text-gold">
          {status}
        </p>
      ) : null}
      <p className="mt-6 text-[12px] text-ivory-dim">
        Your draft stays in this tab when browser storage is available. No more
        than ten new members are hand-selected each month.
      </p>
    </form>
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
        minLength={name === "fullName" ? 2 : undefined}
        autoComplete={
          (
            {
              fullName: "name",
              email: "email",
              phone: "tel",
              city: "address-level2",
              country: "country-name",
              company: "organization",
            } as Record<string, string>
          )[name]
        }
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
      <textarea
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </label>
  );
}
