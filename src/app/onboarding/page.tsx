import { Wordmark } from "@/components/brand/logo";

export const metadata = { title: "Onboarding", robots: { index: false } };

export default function OnboardingPage() {
  return (
    <div className="safe-pad mx-auto min-h-dvh max-w-lg py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">After the threshold</h1>
      <p className="mt-3 text-ivory-muted">
        Approved and paid members complete structured fields: background,
        industries, interests, goals, ambitions, projects, geography, travel,
        causes, strengths, offers, needs, preferred people, communication style,
        availability, and privacy. Matching is recalculated after meaningful
        changes.
      </p>
      <p className="mt-6 text-sm text-gold">Profile-completion meter lives on Profile.</p>
    </div>
  );
}
