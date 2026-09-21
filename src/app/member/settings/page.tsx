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
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Account settings" hasHeading>
      <h1 className="font-serif text-3xl">Account settings</h1>
      <section id="billing" className="mt-8">
        <h2 className="font-serif text-2xl">Billing</h2>
        <p className="mt-2 text-sm text-[var(--navy-soft)]">
          Founding Ten enter at $5,000. After that: $10,000 + $195/month. No discounts.
        </p>
        <a href="/member/billing" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--blue)]">
          Open billing
        </a>
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Referral Rewards</h2>
        <p className="mt-2 text-sm text-[var(--navy-soft)]">
          Members only. 10 points ($1,000 toward redemptions) for each person who joins through you and is admitted.
        </p>
        <a href="/member/rewards" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--blue)]">
          Open Referral Rewards
        </a>
      </section>
      <p className="mt-8 text-sm text-[var(--navy-soft)]">{SOLICITING_BAN}</p>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Help</h2>
        <p className="mt-2 text-sm text-[var(--navy-soft)]">
          Contact a steward, report soliciting, or mute someone from recommendations.
        </p>
        <a href="/member/help#contact" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--blue)]">
          Contact a steward
        </a>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">House notifications</h2>
        <div className="mt-4">
          <HouseNotificationPrefsForm prefs={house} />
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Crossings notifications</h2>
        <p className="mt-2 text-sm text-ivory-muted">Elegant, low-volume. Digests do not repeat.</p>
        <div className="mt-4">
          <NotificationPrefsForm prefs={travel} />
        </div>
      </section>
    </MemberShell>
  );
}
