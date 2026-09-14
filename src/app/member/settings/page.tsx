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
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Settings">
      <ul className="grid gap-4 text-ivory-muted">
        <li>Privacy — members / Index only / hidden. Crossings visibility is set per journey.</li>
        <li>Availability — open, selective, limited, paused.</li>
        <li>Blocks and reports — server-enforced, including travel matching.</li>
        <li>Crossings is not real-time location sharing. City-level presence only.</li>
        <li>{SOLICITING_BAN}</li>
      </ul>
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
