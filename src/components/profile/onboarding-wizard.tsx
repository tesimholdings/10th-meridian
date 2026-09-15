"use client";

import { ExperienceJourney } from "@/components/onboarding/experience-journey";
import { draftFromProfile } from "@/lib/onboarding/draft";
import type { ProfileRecord } from "@/lib/data/types";
import type { ExperienceVariant } from "@/lib/onboarding/copy";

export function OnboardingWizard({
  profile,
  redirectTo = "/member/profile",
  variant = "cinematic",
}: {
  profile: ProfileRecord;
  redirectTo?: string;
  variant?: ExperienceVariant;
}) {
  return (
    <>
      <ExperienceJourney
        mode="member"
        variant={variant}
        initial={draftFromProfile(profile)}
        homeHref={variant === "cinematic" ? "/member/home" : "/member/profile"}
        redirectTo={redirectTo}
      />
      <p className="sr-only">Absolutely no soliciting. Ban with no refund.</p>
    </>
  );
}
