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
      <h1 className="font-serif text-3xl">Notifications</h1>
      <div className="mt-6">
        <NotificationCenter notifications={notes} />
      </div>
    </MemberShell>
  );
}
