import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { OnboardingWizard } from "@/components/profile/onboarding-wizard";
import { PrivacyControls } from "@/components/profile/privacy-controls";
import { ProfileGallery } from "@/components/profile/gallery";
import { viewerProfile, viewerRewardsSnapshot } from "@/lib/preview/store";
import { RewardsTeaserCard } from "@/components/rewards/teaser-card";
import { completionMessage } from "@/lib/profile/completion";
import { intentLabel } from "@/lib/profile/onboarding";
import { loadMemberIntro } from "@/lib/profile/onboarding-server";
import type { ProfileRecord } from "@/lib/data/types";

export const metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; tab?: string }>;
}) {
  const access = await resolveAccessContext();
  const intro = await loadMemberIntro(access.user);
  const p = intro.profile;
  const params = await searchParams;
  const edit = params.edit === "1";
  const tab = params.tab ?? "about";
  const rewards = edit ? null : viewerRewardsSnapshot();

  if (!edit) {
    return (
      <MemberShell user={access.user} demo title="Profile">
        <div className="surface mx-auto flex max-w-xl flex-col items-center rounded-[1.75rem] px-6 py-8 text-center">
          <div className="avatar h-24 w-24 text-3xl" style={{ background: p.accent }}>
            {p.initials}
          </div>
          <h1 className="mt-4 font-serif text-4xl">{p.displayName}</h1>
          <p className="mt-2 max-w-md text-[var(--navy-soft)]">{p.headline}</p>
          <p className="mt-1 text-sm text-[var(--ivory-dim)]">
            {p.city}, {p.country}
          </p>
          <Link href="/onboarding" className="action-quiet mt-5">
            {intro.status === "completed" ? "Edit your introduction" : "Finish your profile"}
          </Link>
          {intro.status === "skipped" ? (
            <p className="mt-3 max-w-sm text-sm text-[var(--ivory-dim)]">
              You skipped the introduction. Finish your profile whenever you like.
            </p>
          ) : null}
          <Link href="/member/profile?edit=1" className="mt-3 text-sm text-[var(--ivory-dim)]">
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
            <p className="surface rounded-3xl p-5 leading-relaxed text-[var(--navy-soft)]">{p.bio}</p>
          )}
          {tab !== "gallery" && (p.intents?.length || p.socialLinks?.length || p.instagram || p.facebook || p.x || p.aboutNow) ? (
            <div className="mt-4 grid gap-3">
              {p.aboutNow ? (
                <p className="text-sm text-[var(--navy-soft)]">{p.aboutNow}</p>
              ) : null}
              {p.intents && p.intents.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {p.intents.map((id) => (
                    <li key={id} className="rounded-full border border-[rgba(196,162,100,0.45)] px-3 py-1 text-xs text-[var(--navy)]">
                      {intentLabel(id)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <SocialList profile={p} />
            </div>
          ) : null}
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
        <OnboardingWizard profile={intro.fresh ? viewerProfile() : p} />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Privacy</h2>
        <PrivacyControls privacy={p.privacy} />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Gallery</h2>
        <ProfileGallery photos={p.gallery ?? []} canEdit />
      </section>
      <Link href="/onboarding" className="mt-4 inline-flex min-h-11 items-center text-sm text-[var(--gold-dim)]">
        {intro.status === "completed" ? "Edit your introduction" : "Finish your profile"}
      </Link>
    </MemberShell>
  );
}

function SocialList({ profile }: { profile: ProfileRecord }) {
  const links = [
    profile.linkedin ? { label: "LinkedIn", url: profile.linkedin } : null,
    profile.instagram ? { label: "Instagram", url: profile.instagram } : null,
    profile.facebook ? { label: "Facebook", url: profile.facebook } : null,
    profile.x ? { label: "X", url: profile.x } : null,
    ...(profile.socialLinks ?? []).map((link) => ({ label: link.label, url: link.url })),
  ].filter((link): link is { label: string; url: string } => Boolean(link));
  if (!links.length) return null;
  return (
    <ul className="flex flex-wrap gap-3 text-sm">
      {links.map((link) => (
        <li key={`${link.label}-${link.url}`}>
          <a href={link.url} className="text-[var(--navy)] underline-offset-4 hover:underline">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
