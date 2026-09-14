import { Wordmark } from "@/components/brand/logo";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Onboarding", robots: { index: false } };

export default function OnboardingPage() {
  const profile = viewerProfile();
  return (
    <div className="safe-pad mx-auto min-h-dvh max-w-lg py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">After the threshold</h1>
      <p className="mt-3 text-ivory-muted">
        Approved and paid members complete structured fields. Matching is
        recalculated after meaningful changes. This preview writes to DEMO state.
      </p>
      <div className="mt-10">
        <OnboardingWizard profile={profile} redirectTo="/member/home" />
      </div>
    </div>
  );
}
