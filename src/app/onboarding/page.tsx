import { redirect } from "next/navigation";
import { ProfileBuilder } from "@/components/profile/profile-builder";
import { resolveAccessContext } from "@/lib/access/context";
import { loadMemberIntro } from "@/lib/profile/onboarding-server";

export const metadata = { title: "Profile", robots: { index: false } };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && !access.decision.allowed) {
    redirect("/");
  }
  const user = access.user;
  if (
    !user ||
    (user.role !== "member" &&
      user.role !== "approved_unpaid" &&
      user.role !== "moderator" &&
      user.role !== "administrator")
  ) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const intro = await loadMemberIntro(user);

  return <ProfileBuilder initial={intro.draft} fromCheckout={params.from === "checkout"} />;
}
