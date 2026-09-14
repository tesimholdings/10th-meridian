import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ProfileActions } from "@/components/members/profile-actions";
import { getPreviewStore, lastHelpAsk } from "@/lib/preview/store";

export const metadata = { title: "Member", robots: { index: false } };

export default async function MemberProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) notFound();
  if (!access.decision.isMemberAccess && !profile.isDemo) notFound();
  const intro = store.intros.find((i) => i.targetId === profile.id);

  return (
    <MemberShell user={access.user} demo title={from === "ask" ? "Who can help" : "Profile"}>
      <div
        className="flex h-20 w-20 items-center justify-center font-serif text-2xl"
        style={{ background: profile.accent }}
      >
        {profile.initials}
      </div>
      <h1 className="mt-6 font-serif text-4xl">{profile.displayName}</h1>
      <p className="mt-2 text-ivory-muted">{profile.headline}</p>
      <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-gold">SYNTHETIC DEMO</p>
      {from === "ask" ? (
        <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
          From Ask the Meridian
        </p>
      ) : null}
      <p className="mt-6 leading-relaxed text-ivory-muted">{profile.bio}</p>
      <dl className="mt-8 grid gap-5">
        <Item label="Role" value={`${profile.roleTitle} · ${profile.company}`} />
        <Item label="City" value={`${profile.city}, ${profile.country}`} />
        <Item label="Offers" value={profile.offers.join(" · ")} />
        <Item label="Needs" value={profile.needs.join(" · ")} />
        <Item label="Goals" value={profile.goals.join(" · ")} />
        <Item label="Travel" value={profile.travel.join(" · ") || "—"} />
        <Item label="Availability" value={profile.availability} />
      </dl>
      <ProfileActions
        targetId={profile.id}
        introStatus={intro?.status}
        askId={from === "ask" ? lastHelpAsk()?.id : undefined}
      />
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
