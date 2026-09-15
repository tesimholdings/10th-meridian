import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { PrivacyControls } from "@/components/profile/privacy-controls";
import { ProfileGallery } from "@/components/profile/gallery";
import { viewerProfile, viewerRewardsSnapshot } from "@/lib/preview/store";
import { RewardsTeaserCard } from "@/components/rewards/teaser-card";
import { completionMessage } from "@/lib/profile/completion";
import { SocialLinks } from "@/components/onboarding/social-links";

export const metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; tab?: string }>;
}) {
  const access = await resolveAccessContext();
  const p = viewerProfile();
  const params = await searchParams;
  const edit = params.edit === "1";
  const tab = params.tab ?? "about";
  const rewards = edit ? null : viewerRewardsSnapshot();

  if (!edit) {
    return (
      <MemberShell user={access.user} demo title="Profile">
        <div className="flex flex-col items-center text-center">
          <div className="avatar h-24 w-24 text-3xl" style={{ background: p.accent }}>
            {p.initials}
          </div>
          <h1 className="mt-4 font-serif text-4xl">{p.displayName}</h1>
          <p className="mt-2 max-w-md text-[var(--navy-soft)]">{p.headline}</p>
          <p className="mt-1 text-sm text-[var(--ivory-dim)]">
            {p.city}, {p.country}
          </p>
          <SocialLinks socials={p.socials} />
          <Link href="/member/profile?edit=1" className="action-quiet mt-5">
            Edit
          </Link>
        </div>
        {rewards ? (
          <div className="mx-auto mt-8 max-w-md">
            <RewardsTeaserCard availablePoints={rewards.availablePoints} compact />
          </div>
        ) : null}
        {p.completion < 90 ? (
          <p className="mt-6 text-center text-sm text-[var(--ivory-dim)]">{completionMessage(p.completion)}</p>
        ) : null}
        <nav className="mt-8 flex border-b border-[var(--line)]">
          <Link href="/member/profile" className={`min-h-11 flex-1 text-center text-sm ${tab === "about" ? "border-b-2 border-[var(--gold)]" : "text-[var(--ivory-dim)]"}`}>
            About
          </Link>
          <Link href="/member/profile?tab=gallery" className={`min-h-11 flex-1 text-center text-sm ${tab === "gallery" ? "border-b-2 border-[var(--gold)]" : "text-[var(--ivory-dim)]"}`}>
            Gallery
          </Link>
        </nav>
        <div className="mt-6">
          {tab === "gallery" ? (
            <ProfileGallery photos={p.gallery ?? []} canEdit />
          ) : (
            <p className="leading-relaxed text-[var(--navy-soft)]">{p.bio}</p>
          )}
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell user={access.user} demo title="Edit profile">
      <Link href="/member/profile" className="text-sm text-[var(--blue)]">
        Back to profile
      </Link>
      <h1 className="mt-4 font-serif text-3xl">Settings</h1>
      {p.completion < 90 ? (
        <p className="mt-2 text-sm text-[var(--ivory-dim)]">{completionMessage(p.completion)}</p>
      ) : null}
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Identity</h2>
        <OnboardingWizard profile={p} variant="compact" />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Privacy</h2>
        <PrivacyControls privacy={p.privacy} />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Gallery</h2>
        <ProfileGallery photos={p.gallery ?? []} canEdit />
      </section>
    </MemberShell>
  );
}
