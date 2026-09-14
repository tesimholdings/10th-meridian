import { Wordmark } from "@/components/brand/logo";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { viewerProfile } from "@/lib/preview/store";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Onboarding", robots: { index: false } };

export default function OnboardingPage() {
  const profile = viewerProfile();
  return (
    <div className="page-enter safe-pad mx-auto min-h-dvh max-w-lg py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">After the threshold</h1>
      <p className="mt-3 text-ivory-muted">
        Approved and paid members complete structured fields. The Index is
        recalculated after meaningful changes. This preview writes to DEMO state.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ivory-dim">{brand.soliciting}</p>
      <div className="mt-10">
        <OnboardingWizard profile={profile} redirectTo="/member/home" />
      </div>
    </div>
  );
}
