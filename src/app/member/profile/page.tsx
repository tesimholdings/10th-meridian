import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { PrivacyControls } from "@/components/profile/privacy-controls";
import { ProfileGallery } from "@/components/profile/gallery";
import { viewerProfile } from "@/lib/preview/store";
import { completionMessage } from "@/lib/profile/completion";
import { SOLICITING_BAN } from "@/lib/copy/community";
import { privacyOf } from "@/lib/network/privacy";

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
      <p className="mt-3 text-sm text-ivory-dim">{SOLICITING_BAN} Profiles are never public or indexed.</p>
      <Link href="/onboarding" className="mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.18em] uppercase text-gold">
        Open full onboarding
      </Link>
      <ProfileGallery photos={p.gallery ?? []} canEdit />
      <PrivacyControls privacy={privacyOf(p)} />
      <div className="mt-10">
        <OnboardingWizard profile={p} />
      </div>
    </MemberShell>
  );
}
