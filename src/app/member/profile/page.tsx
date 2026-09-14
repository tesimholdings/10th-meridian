import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { viewerProfile } from "@/lib/preview/store";
import { completionMessage } from "@/lib/profile/completion";

export const metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const access = await resolveAccessContext();
  const p = viewerProfile();
  return (
    <MemberShell user={access.user} demo title="Profile">
      <div className="h-1 bg-[var(--line)]">
        <div className="h-1 bg-[var(--gold)]" style={{ width: `${p.completion}%` }} />
      </div>
      <p className="mt-2 text-[11px] tracking-[0.18em] uppercase text-gold">
        Completion {p.completion}%
      </p>
      <p className="mt-2 text-sm text-ivory-muted">{completionMessage(p.completion)}</p>
      <Link href="/onboarding" className="mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.18em] uppercase text-gold">
        Open full onboarding
      </Link>
      <div className="mt-10">
        <OnboardingWizard profile={p} />
      </div>
    </MemberShell>
  );
}
