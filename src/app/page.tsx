import { resolveAccessContext } from "@/lib/access/context";
import { LockScreen } from "@/components/lock/lock-screen";
import { PreviewTools } from "@/components/preview/preview-tools";
import { OpenHouseLanding } from "@/components/open-house/landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const access = await resolveAccessContext();

  if (!access.decision.allowed) {
    return (
      <>
        <PreviewTools access={access} />
        <LockScreen
          decision={access.decision}
          referralEarly={access.decision.phase === "referral_early"}
        />
      </>
    );
  }

  if (access.decision.isMemberAccess) {
    const { redirect } = await import("next/navigation");
    redirect("/member/home");
  }

  return (
    <>
      <PreviewTools access={access} />
      <OpenHouseLanding access={access} />
    </>
  );
}
