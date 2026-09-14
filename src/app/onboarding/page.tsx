import { Wordmark } from "@/components/brand/logo";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Onboarding", robots: { index: false } };

export default function OnboardingPage() {
  const profile = viewerProfile();
  return (
    <div className="form-page safe-pad mx-auto min-h-dvh max-w-lg py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">Make yourself known</h1>
      <p className="mt-3 text-ivory-muted">
        A few thoughtful details help us find the people who matter to you. Five
        short steps. You can refine your profile anytime. This preview saves
        DEMO data.
      </p>
      <div className="mt-10">
        <OnboardingWizard profile={profile} redirectTo="/member/home" />
      </div>
    </div>
  );
}
