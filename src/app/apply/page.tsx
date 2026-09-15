import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { ApplyWizard } from "@/components/forms/apply-wizard";

export const metadata = { title: "Application", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    redirect("/remind");
  }
  return <ApplyWizard referralCode={access.referralCode} />;
}
