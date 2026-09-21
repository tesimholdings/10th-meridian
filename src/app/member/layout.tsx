import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { readOnboardingCookie } from "@/lib/profile/onboarding-cookie";
import { readOnboardingDb } from "@/lib/profile/onboarding-db";
import { shouldPromptOnboarding } from "@/lib/profile/onboarding";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && !access.decision.allowed) {
    redirect("/");
  }

  const user = access.user;
  if (user?.role === "member") {
    const cookie = await readOnboardingCookie();
    const cookieForUser = cookie?.accountId === user.id ? cookie : null;
    const db =
      !cookieForUser && !user.isDemo ? (await readOnboardingDb(user.id)).state : "unknown";
    if (
      shouldPromptOnboarding({
        role: user.role,
        accountId: user.id,
        cookie: cookieForUser,
        db,
        isDemo: user.isDemo,
      })
    ) {
      redirect("/onboarding");
    }
  }

  return children;
}
