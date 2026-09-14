import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { NotificationPrefsForm } from "@/components/crossings/notification-prefs";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { DEFAULT_NOTIFICATION_PREFS } from "@/lib/crossings/notifications";

export const metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const prefs = store.crossings.prefs.find((p) => p.profileId === viewer.id) ?? {
    profileId: viewer.id,
    ...DEFAULT_NOTIFICATION_PREFS,
  };
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Settings">
      <ul className="grid gap-4 text-ivory-muted">
        <li>Privacy — members / matches only / hidden. Crossings visibility is set per journey.</li>
        <li>Availability — open, selective, limited, paused.</li>
        <li>Blocks and reports — server-enforced, including travel matching.</li>
        <li>Crossings is not real-time location sharing. City-level presence only.</li>
      </ul>
      <section className="mt-10">
        <p className="label">Crossings notifications</p>
        <p className="mt-2 text-sm text-ivory-muted">Elegant, low-volume. Digests do not repeat.</p>
        <div className="mt-4">
          <NotificationPrefsForm prefs={prefs} />
        </div>
      </section>
    </MemberShell>
  );
}
