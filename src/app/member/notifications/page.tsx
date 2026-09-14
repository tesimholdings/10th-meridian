import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { NotificationCenter } from "@/components/notifications/center";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const access = await resolveAccessContext();
  const viewer = viewerProfile();
  const notes = getPreviewStore().houseNotifications.filter((n) => n.recipientId === viewer.id);
  return (
    <MemberShell user={access.user} demo title="Notifications">
      <h1 className="font-serif text-4xl">A quiet desk</h1>
      <p className="mt-3 max-w-xl text-sm text-ivory-muted">
        New people in a channel, Circle or Index additions, introductions, events, and announcements.
        Nothing here is a campaign.
      </p>
      <div className="mt-8">
        <NotificationCenter notifications={notes} />
      </div>
    </MemberShell>
  );
}
