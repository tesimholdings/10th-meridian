import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ProfileActions } from "@/components/members/profile-actions";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Member", robots: { index: false } };

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) notFound();
  const intro = store.intros.find((i) => i.targetId === profile.id);

  return (
    <MemberShell user={access.user} demo title="Profile">
      <div
        className="member-avatar flex h-20 w-20 items-center justify-center font-serif text-2xl"
        style={{ background: profile.accent }}
      >
        {profile.initials}
      </div>
      <h1 className="mt-6 font-serif text-4xl">{profile.displayName}</h1>
      <p className="mt-2 text-ivory-muted">{profile.headline}</p>
      <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-gold">
        SYNTHETIC DEMO
      </p>
      <p className="mt-6 leading-relaxed text-ivory-muted">{profile.bio}</p>
      <dl className="profile-details mt-8 grid gap-5">
        <Item
          label="Role"
          value={`${profile.roleTitle} · ${profile.company}`}
        />
        <Item label="City" value={`${profile.city}, ${profile.country}`} />
        <Item label="Offers" value={profile.offers.join(" · ")} />
        <Item label="Needs" value={profile.needs.join(" · ")} />
        <Item label="Goals" value={profile.goals.join(" · ")} />
        <Item label="Travel" value={profile.travel.join(" · ") || "—"} />
        <Item label="Availability" value={profile.availability} />
      </dl>
      <ProfileActions targetId={profile.id} introStatus={intro?.status} />
    </MemberShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
