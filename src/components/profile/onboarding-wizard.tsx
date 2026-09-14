"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProfileRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { completionMessage } from "@/lib/profile/completion";

const steps = ["Presence", "Work", "Direction", "Exchange", "Texture"];

function csv(items: string[]) {
  return items.join(", ");
}

function list(value: string) {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function OnboardingWizard({ profile, redirectTo = "/member/profile" }: { profile: ProfileRecord; redirectTo?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    displayName: profile.displayName,
    headline: profile.headline,
    city: profile.city,
    country: profile.country,
    timezone: profile.timezone,
    roleTitle: profile.roleTitle,
    company: profile.company,
    bio: profile.bio,
    industries: csv(profile.industries),
    goals: csv(profile.goals),
    ambitions: csv(profile.ambitions),
    projects: csv(profile.projects),
    strengths: csv(profile.strengths),
    offers: csv(profile.offers),
    needs: csv(profile.needs),
    interests: csv(profile.interests),
    travel: csv(profile.travel),
    causes: csv(profile.causes),
    communicationStyle: profile.communicationStyle,
    availability: profile.availability,
  });
  const [status, setStatus] = useState<string | null>(null);
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  async function save(final = false) {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        industries: list(draft.industries),
        goals: list(draft.goals),
        ambitions: list(draft.ambitions),
        projects: list(draft.projects),
        strengths: list(draft.strengths),
        offers: list(draft.offers),
        needs: list(draft.needs),
        interests: list(draft.interests),
        travel: list(draft.travel),
        causes: list(draft.causes),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; profile?: ProfileRecord };
    if (json.profile) {
      setStatus(`${completionMessage(json.profile.completion)} Completion ${json.profile.completion}%.`);
    }
    if (final) router.push(redirectTo);
    router.refresh();
  }

  return (
    <div>
      <p className="label">
        {steps[step]} · {step + 1} / {steps.length}
      </p>
      <div className="mt-3 h-px bg-[var(--line)]">
        <div className="h-px bg-[var(--gold)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-8 grid gap-4">
        {step === 0 ? (
          <>
            <Field label="Name" value={draft.displayName} onChange={(v) => setDraft({ ...draft, displayName: v })} />
            <Field label="Headline" value={draft.headline} onChange={(v) => setDraft({ ...draft, headline: v })} />
            <Field label="City" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
            <Field label="Country" value={draft.country} onChange={(v) => setDraft({ ...draft, country: v })} />
            <Field label="Timezone" value={draft.timezone} onChange={(v) => setDraft({ ...draft, timezone: v })} />
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Field label="Role" value={draft.roleTitle} onChange={(v) => setDraft({ ...draft, roleTitle: v })} />
            <Field label="Company / house" value={draft.company} onChange={(v) => setDraft({ ...draft, company: v })} />
            <Area label="Bio" value={draft.bio} onChange={(v) => setDraft({ ...draft, bio: v })} />
            <Field label="Industries" value={draft.industries} onChange={(v) => setDraft({ ...draft, industries: v })} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Area label="Goals" value={draft.goals} onChange={(v) => setDraft({ ...draft, goals: v })} />
            <Area label="Ambitions" value={draft.ambitions} onChange={(v) => setDraft({ ...draft, ambitions: v })} />
            <Area label="Projects" value={draft.projects} onChange={(v) => setDraft({ ...draft, projects: v })} />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Area label="Strengths" value={draft.strengths} onChange={(v) => setDraft({ ...draft, strengths: v })} />
            <Area label="Offers" value={draft.offers} onChange={(v) => setDraft({ ...draft, offers: v })} />
            <Area label="Needs" value={draft.needs} onChange={(v) => setDraft({ ...draft, needs: v })} />
          </>
        ) : null}
        {step === 4 ? (
          <>
            <Field label="Interests" value={draft.interests} onChange={(v) => setDraft({ ...draft, interests: v })} />
            <Field label="Travel" value={draft.travel} onChange={(v) => setDraft({ ...draft, travel: v })} />
            <Field label="Causes" value={draft.causes} onChange={(v) => setDraft({ ...draft, causes: v })} />
            <Field label="Communication" value={draft.communicationStyle} onChange={(v) => setDraft({ ...draft, communicationStyle: v })} />
            <label className="grid gap-2">
              <span className="label">Availability</span>
              <select
                value={draft.availability}
                onChange={(e) => setDraft({ ...draft, availability: e.target.value as ProfileRecord["availability"] })}
              >
                <option value="open">open</option>
                <option value="selective">selective</option>
                <option value="limited">limited</option>
                <option value="paused">paused</option>
              </select>
            </label>
          </>
        ) : null}
      </div>
      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button variant="ghost" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button className="flex-1" onClick={() => { void save(); setStep((s) => s + 1); }}>
            Continue
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => void save(true)}>
            Save profile
          </Button>
        )}
      </div>
      {status ? <p className="mt-4 text-sm text-gold">{status}</p> : null}
      <p className="mt-6 text-[12px] text-ivory-dim">
        Matching is recalculated after meaningful changes. Completeness is the difference
        between a faint signal and a precise one.
      </p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
