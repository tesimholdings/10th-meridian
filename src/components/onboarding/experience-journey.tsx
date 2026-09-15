"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExperienceNav, ExperienceShell } from "@/components/onboarding/experience-shell";
import { IdentityChapter } from "@/components/onboarding/identity-chapter";
import { IntentChapter } from "@/components/onboarding/intent-chapter";
import { OfferChapter } from "@/components/onboarding/offer-chapter";
import { ReviewChapter } from "@/components/onboarding/review-chapter";
import { SocialChapter } from "@/components/onboarding/social-chapter";
import { WelcomeChapter } from "@/components/onboarding/welcome-chapter";
import { completionMessage } from "@/lib/profile/completion";
import {
  EXPERIENCE_CHAPTERS,
  REVIEW_APPLY_CTA,
  REVIEW_APPLY_DONE,
  REVIEW_MEMBER_CTA,
  REVIEW_MEMBER_DONE,
  type ExperienceMode,
  type ExperienceVariant,
} from "@/lib/onboarding/copy";
import {
  APPLY_DRAFT_KEY,
  MEMBER_DRAFT_KEY,
  csvList,
  emptyDraft,
  identityReady,
  readDraft,
  writeDraft,
  type ExperienceDraft,
} from "@/lib/onboarding/draft";
import { intentsAreComplete } from "@/lib/onboarding/intents";
import { EMPTY_OAUTH, legacyFromSocials, type OAuthAvailability } from "@/lib/onboarding/socials";
import type { ProfileRecord } from "@/lib/data/types";

export function ExperienceJourney({
  mode,
  variant = "cinematic",
  initial,
  referralCode,
  homeHref,
  redirectTo,
}: {
  mode: ExperienceMode;
  variant?: ExperienceVariant;
  initial: ExperienceDraft;
  referralCode?: string | null;
  homeHref: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const storageKey = mode === "apply" ? APPLY_DRAFT_KEY : MEMBER_DRAFT_KEY;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ExperienceDraft>(() =>
    emptyDraft({
      ...initial,
      referralCode: referralCode || initial.referralCode,
      ...readDraft(storageKey),
    }),
  );
  const [oauth, setOauth] = useState<OAuthAvailability>(EMPTY_OAUTH);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    writeDraft(storageKey, draft);
  }, [draft, storageKey]);

  useEffect(() => {
    void fetch("/api/profile/socials")
      .then((res) => res.json())
      .then((json: { oauth?: OAuthAvailability }) => {
        if (json.oauth) setOauth(json.oauth);
      })
      .catch(() => undefined);
  }, []);

  function patch(next: Partial<ExperienceDraft>) {
    setDraft((current) => ({ ...current, ...next }));
    setStatus(null);
  }

  function canLeave(from: number): boolean {
    if (from === 1 && !intentsAreComplete(draft.intents, draft.intentOther)) {
      setStatus("Choose at least one reason — and a line if you picked Other.");
      return false;
    }
    if (from === 2 && !identityReady(draft, mode)) {
      setStatus(
        mode === "apply"
          ? "Name, email, city, country, and role are required."
          : "Name, city, country, and role are required.",
      );
      return false;
    }
    return true;
  }

  async function persistMember() {
    const legacy = legacyFromSocials(draft.socials);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: draft.displayName || draft.fullName,
        headline: draft.headline,
        city: draft.city,
        country: draft.country,
        timezone: draft.timezone,
        roleTitle: draft.roleTitle,
        company: draft.company,
        bio: draft.bio,
        website: legacy.website,
        linkedin: legacy.linkedin,
        intents: draft.intents,
        intentOther: draft.intentOther,
        socials: draft.socials,
        offers: csvList(draft.offers),
        needs: csvList(draft.needs),
        strengths: csvList(draft.strengths),
        industries: csvList(draft.industries),
        interests: csvList(draft.interests),
        goals: csvList(draft.goals),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; profile?: ProfileRecord };
    if (json.profile) {
      setStatus(`${completionMessage(json.profile.completion)} Completion ${json.profile.completion}%.`);
    }
    return json;
  }

  async function submitApply() {
    if (draft.terms !== "yes") {
      setStatus("Agreement is required.");
      return;
    }
    const legacy = legacyFromSocials(draft.socials);
    setSubmitting(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        website: legacy.website,
        linkedin: legacy.linkedin,
        terms: draft.terms,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setSubmitting(false);
    setStatus(json.message ?? (json.ok ? REVIEW_APPLY_DONE : "Could not submit."));
  }

  async function advance() {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (!canLeave(step)) return;
    if (mode === "member" && step > 0) void persistMember();
    if (step < EXPERIENCE_CHAPTERS.length - 1) {
      setStep((n) => n + 1);
      return;
    }
    if (mode === "apply") {
      await submitApply();
      return;
    }
    setSubmitting(true);
    await persistMember();
    setSubmitting(false);
    setStatus(REVIEW_MEMBER_DONE);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  const last = step === EXPERIENCE_CHAPTERS.length - 1;

  return (
    <ExperienceShell step={step} variant={variant} homeHref={homeHref} footer={
      step === 0 ? null : (
        <>
          <ExperienceNav
            step={step}
            continueLabel={last ? (mode === "apply" ? REVIEW_APPLY_CTA : REVIEW_MEMBER_CTA) : "Continue"}
            onBack={() => {
              setStatus(null);
              setStep((n) => Math.max(0, n - 1));
            }}
            onContinue={() => void advance()}
            submitting={submitting}
          />
          {status ? <p className="mt-4 text-sm text-[var(--gold-dim)]">{status}</p> : null}
        </>
      )
    }>
      {step === 0 ? <WelcomeChapter mode={mode} onBegin={() => void advance()} /> : null}
      {step === 1 ? (
        <IntentChapter
          selected={draft.intents}
          other={draft.intentOther}
          onChange={({ intents, intentOther }) => patch({ intents, intentOther })}
        />
      ) : null}
      {step === 2 ? <IdentityChapter mode={mode} draft={draft} onChange={patch} /> : null}
      {step === 3 ? (
        <SocialChapter
          socials={draft.socials}
          oauth={oauth}
          persistToProfile={mode === "member"}
          onChange={(socials) => patch({ socials })}
        />
      ) : null}
      {step === 4 ? <OfferChapter draft={draft} onChange={patch} /> : null}
      {step === 5 ? <ReviewChapter mode={mode} draft={draft} onChange={patch} /> : null}
    </ExperienceShell>
  );
}
