"use client";

import { useEffect, useState } from "react";
import { FormalLockup } from "@/components/brand/logo";
import { LockGrain } from "@/components/lock/lock-grain";
import { Button } from "@/components/ui/button";
import { SOLICITING_BAN } from "@/lib/copy/community";
import {
  MEMBER_INTENTS,
  SAMPLE_PORTRAIT_LABEL,
  SAMPLE_PORTRAIT_URL,
  SOCIAL_NETWORKS,
  normalizeSocialInput,
  type OnboardingDraft,
  type SocialNetworkId,
} from "@/lib/profile/onboarding";

const STEPS = [
  { kicker: "Portrait", title: "Your portrait" },
  { kicker: "Socials", title: "Connect your socials" },
  { kicker: "About you", title: "A few things worth knowing" },
  { kicker: "Looking for", title: "What you're looking for" },
] as const;

export function ProfileBuilder({
  initial,
  fromCheckout = false,
}: {
  initial: OnboardingDraft;
  fromCheckout?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [reduced, setReduced] = useState(false);
  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  async function persist(action: "save" | "skip" | "complete") {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...draft }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        redirect?: string | null;
      } | null;
      if (!res.ok || !json?.ok) {
        setError(json?.message ?? "Could not save. You can skip for now.");
        setSaving(false);
        return false;
      }
      if (json.redirect) {
        if (action === "complete" && !reduced) {
          setCelebrating(true);
          window.setTimeout(() => window.location.assign(json.redirect!), 720);
          return true;
        }
        window.location.assign(json.redirect);
        return true;
      }
      setSaving(false);
      return true;
    } catch {
      setError("Could not save. You can skip for now.");
      setSaving(false);
      return false;
    }
  }

  async function skip() {
    await persist("skip");
  }

  async function forward() {
    if (step < STEPS.length - 1) {
      const saved = await persist("save");
      if (saved) setStep((current) => current + 1);
      return;
    }
    await persist("complete");
  }

  return (
    <div className="profile-builder lock-gold relative min-h-dvh text-white">
      <LockGrain />
      <div className="safe-pad safe-top relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center justify-between gap-4 pt-4">
          <FormalLockup knockout className="h-8 w-auto max-w-[min(58vw,13rem)]" />
          <button
            type="button"
            onClick={() => void skip()}
            disabled={saving}
            className="min-h-11 shrink-0 px-1 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Skip for now
          </button>
        </header>

        <p className="mt-10 text-[11px] tracking-[0.22em] text-[#c4a264] uppercase">
          {STEPS[step].kicker} · {step + 1} / {STEPS.length}
        </p>
        <div className="signup-progress mt-3" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div key={step} className="signup-step">
        <h1 className="mt-6 font-serif text-4xl leading-tight text-white">{STEPS[step].title}</h1>
        {fromCheckout && step === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-[#c9bfa8]">
            Payment is confirmed. A portrait, then a short introduction, so the house knows who belongs in the room.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[#c9bfa8]">{stepIntro(step)}</p>
        )}

        <div className="mt-8 grid gap-4">
          {step === 0 ? <PortraitStep draft={draft} onChange={setDraft} /> : null}
          {step === 1 ? <SocialStep draft={draft} onChange={setDraft} /> : null}
          {step === 2 ? <AboutStep draft={draft} onChange={setDraft} /> : null}
          {step === 3 ? <IntentStep draft={draft} onChange={setDraft} /> : null}
        </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-[#d4af6a]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex gap-3">
          {step > 0 ? (
            <Button
              variant="ghost"
              className="flex-1"
              disabled={saving}
              onClick={() => {
                setError(null);
                setStep((current) => current - 1);
              }}
            >
              Back
            </Button>
          ) : null}
          <Button className="flex-1" disabled={saving} onClick={() => void forward()}>
            {saving ? "Saving" : step === STEPS.length - 1 ? "Enter the house" : "Continue"}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => void skip()}
          disabled={saving}
          className="mt-4 min-h-11 text-sm text-white/60 hover:text-white"
        >
          Skip for now
        </button>
      </div>
      {celebrating ? (
        <div className="signup-celebrate" role="status">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.22em] text-[#c4a264] uppercase">Welcome</p>
            <p className="mt-3 font-serif text-5xl text-white">The house is open.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function stepIntro(step: number): string {
  if (step === 0) {
    return "A square crop, then you are in. Take a photo, choose one, or use the labeled sample.";
  }
  if (step === 1) {
    return "Paste a link or a handle. These networks do not sign you in.";
  }
  if (step === 2) {
    return "Answer in your own words. Each question has an example. Leave any of them blank.";
  }
  return "Choose any that fit. Tags stay structured so matching can use them later, along with the sentence you write.";
}

function PortraitStep({
  draft,
  onChange,
}: {
  draft: OnboardingDraft;
  onChange: (next: OnboardingDraft) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const portrait = draft.portraitUrl ?? "";

  async function applyFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setNote(null);
    try {
      const url = await cropSquare(file);
      onChange({ ...draft, portraitUrl: url, portraitLabel: "Portrait" });
    } catch {
      setNote("That photo could not be cropped. Try another, or use the sample.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portrait-stage">
      <div className={`portrait-frame ${portrait ? "is-set portrait-seal" : ""}`}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait} alt={draft.portraitLabel || "Your portrait"} />
        ) : (
          <span className="grid h-full place-items-center px-6 text-center font-serif text-2xl text-[#efe6d4]">
            Your face, here
          </span>
        )}
      </div>
      <div className="portrait-actions">
        <label className="action-quiet cursor-pointer">
          {busy ? "Cropping" : "Choose a photo"}
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void applyFile(file);
            }}
          />
        </label>
        <label className="action-quiet cursor-pointer">
          Take a photo
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            capture="user"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void applyFile(file);
            }}
          />
        </label>
        <button
          type="button"
          className="action-quiet"
          onClick={() =>
            onChange({
              ...draft,
              portraitUrl: SAMPLE_PORTRAIT_URL,
              portraitLabel: SAMPLE_PORTRAIT_LABEL,
            })
          }
        >
          Use sample portrait
        </button>
      </div>
      <p className="max-w-sm text-center text-xs leading-relaxed text-white/50">
        {portrait === SAMPLE_PORTRAIT_URL
          ? SAMPLE_PORTRAIT_LABEL
          : "Cropped square. The sample is labeled and is not a member photograph."}
      </p>
      {note ? <p className="text-sm text-[#d4af6a]">{note}</p> : null}
    </div>
  );
}

async function cropSquare(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 480, 480);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function SocialStep({
  draft,
  onChange,
}: {
  draft: OnboardingDraft;
  onChange: (next: OnboardingDraft) => void;
}) {
  return (
    <>
      {SOCIAL_NETWORKS.map((network) => (
        <SocialField
          key={network.id}
          label={network.label}
          example={network.example}
          placeholder={network.placeholder}
          value={draft[network.id]}
          onChange={(value) => onChange({ ...draft, [network.id]: value })}
        />
      ))}
      <div className="mt-2">
        <p className="text-sm text-white">Another social</p>
        <p className="mt-1 text-xs text-white/45">Example: Threads, YouTube, a personal site.</p>
      </div>
      {draft.others.map((row, index) => (
        <div key={index} className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="label">Name</span>
            <input
              value={row.label}
              placeholder="Threads"
              onChange={(event) => {
                const others = draft.others.slice();
                others[index] = { ...row, label: event.target.value };
                onChange({ ...draft, others });
              }}
            />
          </label>
          <label className="grid gap-2">
            <span className="label">Link</span>
            <input
              value={row.url}
              inputMode="url"
              placeholder="https://"
              onChange={(event) => {
                const others = draft.others.slice();
                others[index] = { ...row, url: event.target.value };
                onChange({ ...draft, others });
              }}
            />
          </label>
        </div>
      ))}
      {draft.others.length < 4 ? (
        <button
          type="button"
          className="min-h-11 text-left text-sm text-[#c4a264]"
          onClick={() => onChange({ ...draft, others: [...draft.others, { label: "", url: "" }] })}
        >
          Add another
        </button>
      ) : null}
    </>
  );
}

function SocialField({
  label,
  example,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  example: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const network = SOCIAL_NETWORKS.find((item) => item.label === label)?.id ?? "linkedin";
  const linked = normalizeSocialInput(network as SocialNetworkId, value);
  return (
    <label className="grid gap-2 rounded-2xl border border-white/10 px-4 py-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm text-white">{label}</span>
        {value.trim() && linked.ok && linked.url ? (
          <span className="text-[11px] tracking-[0.16em] text-[#c4a264] uppercase">Linked</span>
        ) : (
          <span className="text-[11px] tracking-[0.16em] text-white/35 uppercase">Link</span>
        )}
      </span>
      <input
        value={value}
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="text-xs text-white/45">Example: {example}</span>
    </label>
  );
}

function AboutStep({
  draft,
  onChange,
}: {
  draft: OnboardingDraft;
  onChange: (next: OnboardingDraft) => void;
}) {
  return (
    <>
      <Question
        label="What should people know you for?"
        example="I build quiet companies and host dinners in Lisbon."
        value={draft.knownFor}
        onChange={(knownFor) => onChange({ ...draft, knownFor })}
      />
      <Question
        label="What are you doing now?"
        example="Opening a second studio and writing on hospitality."
        value={draft.aboutNow}
        onChange={(aboutNow) => onChange({ ...draft, aboutNow })}
      />
      <Question
        label="Where are you based?"
        example="Mexico City — often in London."
        value={draft.basedIn}
        onChange={(basedIn) => onChange({ ...draft, basedIn })}
      />
      <Question
        label="In your own words"
        example="Operator, founder, and the person who remembers the wine."
        value={draft.bio}
        multiline
        onChange={(bio) => onChange({ ...draft, bio })}
      />
      <Question
        label="What do you care about lately?"
        example="architecture, long walks, early companies"
        value={draft.interests}
        onChange={(interests) => onChange({ ...draft, interests })}
      />
    </>
  );
}

function Question({
  label,
  example,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  example: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-white">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      <span className="text-xs text-white/45">Example: {example}</span>
    </label>
  );
}

function IntentStep({
  draft,
  onChange,
}: {
  draft: OnboardingDraft;
  onChange: (next: OnboardingDraft) => void;
}) {
  function toggle(id: string) {
    const intents = draft.intents.includes(id)
      ? draft.intents.filter((item) => item !== id)
      : [...draft.intents, id];
    onChange({ ...draft, intents });
  }

  return (
    <>
      <div className="grid gap-3">
        {MEMBER_INTENTS.map((intent) => {
          const on = draft.intents.includes(intent.id);
          return (
            <button
              key={intent.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(intent.id)}
              className="intent-chip"
            >
              <span className="block text-sm">{intent.label}</span>
              <span className={`mt-1 block text-xs ${on ? "text-black/70" : "text-white/45"}`}>
                Example: {intent.example}
              </span>
            </button>
          );
        })}
      </div>
      <label className="mt-2 grid gap-2">
        <span className="text-sm text-white">In a sentence</span>
        <textarea
          value={draft.intentNote}
          onChange={(event) => onChange({ ...draft, intentNote: event.target.value })}
        />
        <span className="text-xs text-white/45">
          Example: I want a few people I can travel with and one operator who will tell me the truth.
        </span>
      </label>
      <p className="text-xs leading-relaxed text-white/45">{SOLICITING_BAN}</p>
    </>
  );
}
