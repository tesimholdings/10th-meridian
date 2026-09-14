import { BottomNav } from "@/components/member/bottom-nav";
import { DesktopRail } from "@/components/member/desktop-rail";
import { MemberHeader } from "@/components/member/member-header";
import { DemoDisclosure } from "@/components/brand/demo-disclosure";
import { unreadHouseNotifications, unreadTotal, viewerProfile } from "@/lib/preview/store";
import type { SessionUser } from "@/lib/access/session";

export function MemberShell({
  user,
  demo,
  title,
  children,
  flush = false,
}: {
  user: SessionUser | null;
  demo: boolean;
  title?: string;
  children: React.ReactNode;
  flush?: boolean;
}) {
  const unreadNotes = unreadHouseNotifications(viewerProfile().id);
  const unreadMessages = unreadTotal();

  return (
    <div className="house-light min-h-dvh text-[var(--navy)]">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <DesktopRail unreadMessages={unreadMessages} />
        <div className="min-w-0 flex-1">
          <MemberHeader user={user} unreadNotifications={unreadNotes} />
          {demo ? (
            <div className="safe-pad">
              <DemoDisclosure />
            </div>
          ) : null}
          <main className={flush ? "safe-bottom" : "safe-pad safe-bottom relative mx-auto max-w-3xl py-6"}>
            {title && !flush ? <h1 className="sr-only">{title}</h1> : null}
            {children}
          </main>
          <BottomNav unreadMessages={unreadMessages} />
        </div>
      </div>
    </div>
  );
}
