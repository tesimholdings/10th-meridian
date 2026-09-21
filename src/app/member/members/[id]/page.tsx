import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ProfileActions } from "@/components/members/profile-actions";
import { ProfileGallery } from "@/components/profile/gallery";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { presentProfile, visibleEvents } from "@/lib/network/privacy";
import { isInCircle, isRemovedFromIndex } from "@/lib/network/circle";
import { mutualConnections, mutualHref } from "@/lib/network/mutual";
import { formatEventWhen } from "@/lib/events/when";
import { FoundingBadge } from "@/components/members/founding-badge";
import { memberSurfaceCopy } from "@/lib/member/surface-copy";

export const metadata = { title: "Member", robots: { index: false, follow: false } };

export default async function MemberProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "about" } = await searchParams;
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
    events: store.events,
  });
  const events = visibleEvents(store.events, profile.attendingEventIds);
  const own = viewer.id === profile.id;

  return (
    <MemberShell user={access.user} demo title={profile.displayName} hasHeading>
      <div className="flex flex-col items-center text-center">
        <div className="avatar h-24 w-24 text-3xl" style={{ background: profile.accent }}>
          {profile.initials}
        </div>
        <h1 className="mt-4 font-serif text-4xl">{profile.displayName}</h1>
        {profile.foundingMember ? (
          <div className="mt-2">
            <FoundingBadge />
          </div>
        ) : null}
        <p className="mt-2 max-w-md text-[var(--navy-soft)]">{profile.headline}</p>
        <p className="mt-1 text-sm text-[var(--ivory-dim)]">
          {profile.city}
          {profile.country ? `, ${profile.country}` : ""}
        </p>
      </div>

      {own ? (
        <div className="mt-6 flex justify-center">
          <Link href="/member/profile?edit=1" className="action-quiet">
            Edit
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex justify-center">
          <ProfileActions
            targetId={profile.id}
            introStatus={intro?.status}
            inCircle={inCircle}
            removedFromIndex={removedFromIndex}
            compact
          />
        </div>
      )}

      {mutual.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-normal text-[var(--ivory-dim)]">In common</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto hide-scroll">
            {mutual.map((m) => (
              <Link
                key={m.id}
                href={mutualHref(m)}
                className="flex flex-col items-center gap-1"
                aria-label={m.label}
              >
                <span
                  className="avatar h-12 w-12 text-sm"
                  style={{ background: m.kind === "circle" ? "#087CB8" : m.kind === "event" ? "#C4A264" : "#1a1a1a" }}
                >
                  {m.initials}
                </span>
                <span className="max-w-[5.5rem] truncate text-xs text-[var(--ivory-dim)]">{m.displayName}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="mt-8 flex border-b border-[var(--line)]" aria-label="Profile sections">
        <Tab href={`/member/members/${profile.id}`} on={tab === "about"}>About</Tab>
        <Tab href={`/member/members/${profile.id}?tab=gallery`} on={tab === "gallery"}>Gallery</Tab>
        <Tab href={`/member/members/${profile.id}?tab=events`} on={tab === "events"}>Events</Tab>
      </nav>

      <div className="mt-6">
        {tab === "gallery" ? <ProfileGallery photos={profile.gallery ?? []} /> : null}
        {tab === "events" ? (
          events.length ? (
            <ul className="grid gap-3">
              {events.map((e) => (
                <li key={e.id}>
                  <Link href={`/member/events/${e.id}`} className="font-serif text-xl">
                    {e.title}
                  </Link>
                  <p className="text-sm text-[var(--ivory-dim)]">
                    {formatEventWhen(e.startsAt, e.city)} · {e.city}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--ivory-dim)]">No upcoming events listed.</p>
          )
        ) : null}
        {tab === "about" || !["gallery", "events"].includes(tab) ? (
          <dl className="grid gap-4 text-left">
            <Item label="Role" value={`${profile.roleTitle} · ${profile.company}`} />
            <Item label="About" value={memberSurfaceCopy(profile.bio)} />
            {profile.offers.length ? <Item label="Offers" value={profile.offers.join(" · ")} /> : null}
            {profile.needs.length ? <Item label="Needs" value={profile.needs.join(" · ")} /> : null}
            {profile.website ? <Item label="Website" value={profile.website} /> : null}
          </dl>
        ) : null}
      </div>
    </MemberShell>
  );
}

function Tab({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`tab-slide min-h-11 flex-1 text-center text-sm ${
        on ? "border-b-2 border-[var(--gold)]" : "text-[var(--ivory-dim)]"
      }`}
    >
      {children}
    </Link>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-[var(--ivory-dim)]">{label}</dt>
      <dd className="mt-1 leading-relaxed">{value}</dd>
    </div>
  );
}
