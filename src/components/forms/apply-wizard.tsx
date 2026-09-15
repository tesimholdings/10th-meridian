"use client";

import { ExperienceJourney } from "@/components/onboarding/experience-journey";
import { emptyDraft } from "@/lib/onboarding/draft";
export function ApplyWizard({ referralCode }: { referralCode?: string | null }) {
  return (
    <>
      <ExperienceJourney
        mode="apply"
        variant="cinematic"
        initial={emptyDraft({ referralCode: referralCode ?? "" })}
        referralCode={referralCode}
        homeHref="/open-house"
      />
      <p className="sr-only">Absolutely no soliciting. Ban with no refund.</p>
    </>
  );
}
