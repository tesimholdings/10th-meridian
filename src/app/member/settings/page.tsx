import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { NotificationPrefsForm } from "@/components/crossings/notification-prefs";
import { HouseNotificationPrefsForm } from "@/components/notifications/prefs-form";
import { getPreviewStore, housePrefsFor, viewerProfile } from "@/lib/preview/store";
import { DEFAULT_NOTIFICATION_PREFS } from "@/lib/crossings/notifications";
import { SOLICITING_BAN } from "@/lib/copy/community";

export const metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const travel = store.crossings.prefs.find((p) => p.profileId === viewer.id) ?? {
    profileId: viewer.id,
    ...DEFAULT_NOTIFICATION_PREFS,
  };
  const house = housePrefsFor(viewer.id);
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Account settings">
      <h1 className="font-serif text-3xl">Account settings</h1>
      <section id="billing" className="mt-8">
        <h2 className="font-serif text-2xl">Billing</h2>
        <p className="mt-2 text-sm text-[var(--navy-soft)]">
          Lifetime membership is $10,000. Monthly billing is not offered.
        </p>
        <a href="/member/billing" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--blue)]">
          Open billing
        </a>
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Referral Rewards</h2>
        <p className="mt-2 text-sm text-[var(--navy-soft)]">
          Members only. $1,000 Meridian Credit for each person who joins through you and is admitted.
        </p>
        <a href="/member/rewards" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--blue)]">
          Open Referral Rewards
        </a>
      </section>
      <p className="mt-8 text-sm text-[var(--navy-soft)]">{SOLICITING_BAN}</p>
      <section className="mt-10">
        <p className="label">House notifications</p>
        <div className="mt-4">
          <HouseNotificationPrefsForm prefs={house} />
        </div>
      </section>
      <section className="mt-10">
        <p className="label">Crossings notifications</p>
        <p className="mt-2 text-sm text-ivory-muted">Elegant, low-volume. Digests do not repeat.</p>
        <div className="mt-4">
          <NotificationPrefsForm prefs={travel} />
        </div>
      </section>
    </MemberShell>
  );
}
