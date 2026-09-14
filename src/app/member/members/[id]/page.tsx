import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ProfileActions } from "@/components/members/profile-actions";
import { ProfileGallery } from "@/components/profile/gallery";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { presentProfile, visibleEvents } from "@/lib/network/privacy";
import { isInCircle, isRemovedFromIndex } from "@/lib/network/circle";
import { mutualConnections } from "@/lib/network/mutual";

export const metadata = { title: "Member", robots: { index: false, follow: false } };

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const raw = store.profiles.find((p) => p.id === id);
  if (!raw) notFound();
  const viewer = viewerProfile();
  const profile = presentProfile(raw, {
    viewerId: viewer.id,
    isOpenHouseGuest: !access.decision.isMemberAccess,
  });
  const intro = store.intros.find((i) => i.targetId === profile.id);
  const inCircle = isInCircle(viewer.id, profile.id, store.circle);
  const removedFromIndex = isRemovedFromIndex(viewer.id, profile.id, store.indexRemovals);
  const mutual = mutualConnections({
    viewerId: viewer.id,
    targetId: profile.id,
    profiles: store.profiles,
    circle: store.circle,
    channels: store.channels,
    channelMembers: store.channelMembers,
  });
  const events = visibleEvents(store.events, profile.attendingEventIds);

  return (
    <MemberShell user={access.user} demo title="Profile">
      <div
        className="rise flex h-20 w-20 items-center justify-center font-serif text-2xl"
        style={{ background: profile.accent }}
      >
        {profile.initials}
      </div>
      <h1 className="mt-6 font-serif text-4xl">{profile.displayName}</h1>
      <p className="mt-2 text-ivory-muted">{profile.headline}</p>
      <p className="mt-2 text-[11px] tracking-[0.16em] uppercase text-gold">SYNTHETIC DEMO</p>
      <p className="mt-6 leading-relaxed text-ivory-muted">{profile.bio}</p>
      <dl className="mt-8 grid gap-5">
        <Item label="Role" value={`${profile.roleTitle} · ${profile.company}`} />
        <Item label="City" value={`${profile.city}, ${profile.country}`} />
        {profile.website ? (
          <Item label="Website" value={profile.website} />
        ) : null}
        {profile.linkedin ? (
          <Item label="LinkedIn" value={profile.linkedin} />
        ) : null}
        {profile.offers.length ? <Item label="Offers" value={profile.offers.join(" · ")} /> : null}
        {profile.needs.length ? <Item label="Needs" value={profile.needs.join(" · ")} /> : null}
        {profile.strengths.length ? <Item label="Strengths" value={profile.strengths.join(" · ")} /> : null}
        <Item label="Goals" value={profile.goals.join(" · ")} />
        <Item label="Travel" value={profile.travel.join(" · ") || "—"} />
        <Item label="Availability" value={profile.availability} />
      </dl>

      {mutual.length ? (
        <section className="mt-10">
          <p className="label">In common</p>
          <ul className="mt-3 grid gap-2">
            {mutual.map((m) => (
              <li key={m.id} className="text-sm text-ivory-muted">
                {m.displayName} · {m.label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {events.length ? (
        <section className="mt-10">
          <p className="label">Upcoming Meridian events</p>
          <ul className="mt-3 grid gap-3">
            {events.map((e) => (
              <li key={e.id}>
                <Link href={`/member/events/${e.id}`} className="font-serif text-xl">
                  {e.title}
                </Link>
                <p className="text-sm text-ivory-muted">
                  {e.city} · {e.listingState}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ProfileGallery photos={profile.gallery ?? []} />

      {viewer.id === profile.id ? (
        <Link href="/member/profile" className="mt-8 inline-flex min-h-11 text-[11px] tracking-[0.18em] uppercase text-gold">
          Edit your profile
        </Link>
      ) : (
        <ProfileActions
          targetId={profile.id}
          introStatus={intro?.status}
          inCircle={inCircle}
          removedFromIndex={removedFromIndex}
        />
      )}
    </MemberShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-1 break-all">{value}</dd>
    </div>
  );
}
