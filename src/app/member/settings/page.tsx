import Link from "next/link";
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
    <MemberShell
      user={access.user}
      demo={!access.decision.isMemberAccess}
      title="Settings"
    >
      <h1 className="font-serif">On your terms.</h1>
      <p className="mt-5 max-w-xl text-ivory-muted">
        Choose when to connect and which Crossings updates you receive.
        Travel visibility is set separately for each journey.
      </p>
      <Link className="quiet-link mt-4 text-gold" href="/member/profile">
        Manage your profile →
      </Link>
      <ul className="mt-8 grid gap-4 text-ivory-muted">
        <li>Crossings — city-level presence, never live location.</li>
        <li>Privacy — visibility controls are not yet available here.</li>
        <li>Availability — open, selective, limited, paused.</li>
        <li>Crossings block and report actions are available in travel recommendations.</li>
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
