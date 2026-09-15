"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { campaign, campaignFallbacks } from "@/lib/atmosphere/campaign";
import {
  EXPERIENCE_CHAPTERS,
  EXPERIENCE_EDITORIAL,
  type ExperienceVariant,
} from "@/lib/onboarding/copy";

export function ExperienceShell({
  step,
  variant,
  homeHref,
  children,
  footer,
}: {
  step: number;
  variant: ExperienceVariant;
  homeHref: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const chapter = EXPERIENCE_CHAPTERS[step] ?? EXPERIENCE_CHAPTERS[0];
  const still = campaign[chapter.still] ?? campaignFallbacks[chapter.still];
  const progress = ((step + 1) / EXPERIENCE_CHAPTERS.length) * 100;

  if (variant === "compact") {
    return (
      <div>
        <p className="label">
          {chapter.title} · {step + 1} of {EXPERIENCE_CHAPTERS.length}
        </p>
        <div className="experience-progress mt-3" aria-hidden>
          <div className="experience-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="chapter-in mt-8">{children}</div>
        {footer}
      </div>
    );
  }

  return (
    <div className="experience-stage house-light text-[var(--navy)]">
      <div className="experience-still" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={still} alt="" className="experience-still-art" />
        <div className="experience-still-veil" />
        <div className="grain experience-grain" />
      </div>

      <header className="relative z-20 flex items-center justify-between gap-4 px-[max(1.25rem,env(safe-area-inset-left))] pb-2 pt-[max(0.9rem,env(safe-area-inset-top))]">
        <Link href={homeHref} className="min-h-11">
          <Wordmark compact surface="dark" />
        </Link>
        <Link
          href={homeHref}
          className="min-h-11 px-2 text-[11px] tracking-[0.18em] uppercase text-[#faf8f2]/80"
        >
          Close
        </Link>
      </header>

      <div className="relative z-20 mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-6xl flex-col justify-end px-[max(1.25rem,env(safe-area-inset-left))] pb-6 md:justify-center md:px-10">
        <div className="experience-card chapter-in md:ml-auto md:w-[min(34rem,100%)]">
          <p className="label">
            {String(step + 1).padStart(2, "0")} · {chapter.title}
          </p>
          <div className="experience-progress mt-3" aria-hidden>
            <div className="experience-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-6">{children}</div>
          {footer}
          <p className="mt-6 text-[10px] tracking-[0.16em] uppercase text-[var(--ivory-dim)]">
            {EXPERIENCE_EDITORIAL}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExperienceNav({
  step,
  canContinue,
  continueLabel = "Continue",
  onBack,
  onContinue,
  submitting,
}: {
  step: number;
  canContinue?: boolean;
  continueLabel?: string;
  onBack: () => void;
  onContinue: () => void;
  submitting?: boolean;
}) {
  return (
    <div className="mt-8 flex gap-3">
      {step > 0 ? (
        <Button variant="quiet" className="flex-1" onClick={onBack}>
          Back
        </Button>
      ) : null}
      <Button className="flex-1" disabled={canContinue === false || submitting} onClick={onContinue}>
        {submitting ? "One moment…" : continueLabel}
      </Button>
    </div>
  );
}
