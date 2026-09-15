import { BottomNav } from "@/components/member/bottom-nav";
import { DesktopRail } from "@/components/member/desktop-rail";
import { MemberHeader } from "@/components/member/member-header";
import { DemoDisclosure } from "@/components/brand/demo-disclosure";
import { CrossingsFlightProvider } from "@/components/crossings/crossings-flight";
import { unreadHouseNotifications, unreadTotal, viewerProfile, getPreviewStore } from "@/lib/preview/store";
import type { SessionUser } from "@/lib/access/session";

export function MemberShell({
  user,
  demo,
  title,
  children,
  flush = false,
  hasHeading = false,
}: {
  user: SessionUser | null;
  demo: boolean;
  title?: string;
  children: React.ReactNode;
  flush?: boolean;
  hasHeading?: boolean;
}) {
  const viewer = viewerProfile();
  const unreadNotes = unreadHouseNotifications(viewer.id);
  const unreadMessages = unreadTotal();
  const tripCity = getPreviewStore().crossings.journeys.find(
    (j) => j.profileId === viewer.id && j.status === "active",
  )?.destinationCity;

  return (
    <CrossingsFlightProvider city={tripCity}>
    <div className="house-light min-h-dvh w-full text-[var(--navy)]">
      <div className="member-frame mx-auto flex min-h-dvh w-full">
        <DesktopRail unreadMessages={unreadMessages} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MemberHeader user={user} unreadNotifications={unreadNotes} />
          {demo ? (
            <div className="safe-pad">
              <DemoDisclosure />
            </div>
          ) : null}
          <main
            className={
              flush
                ? "member-main safe-bottom relative w-full flex-1"
                : "member-main safe-pad safe-bottom relative w-full flex-1 py-6 md:py-8"
            }
          >
            {title && !flush && !hasHeading ? <h1 className="sr-only">{title}</h1> : null}
            {children}
          </main>
          <BottomNav unreadMessages={unreadMessages} />
        </div>
      </div>
    </div>
    </CrossingsFlightProvider>
  );
}
