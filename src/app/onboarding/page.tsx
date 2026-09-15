import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Onboarding", robots: { index: false } };

export default function OnboardingPage() {
  const profile = viewerProfile();
  return <OnboardingWizard profile={profile} redirectTo="/member/home" variant="cinematic" />;
}
