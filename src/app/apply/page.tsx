import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { ApplyWizard } from "@/components/forms/apply-wizard";
import { PublicShell } from "@/components/open-house/public-shell";

export const metadata = { title: "Application", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    redirect("/remind");
  }
  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">An application, not a form letter</h1>
      <p className="mt-3 text-sm text-[var(--navy-soft)]">
        Selection is discretionary. Completeness helps. Nothing here guarantees a
        place. No more than ten new members are hand-selected each month.
        Lifetime membership is $10,000. Absolutely no soliciting. Ban with no refund.
      </p>
      <div className="surface mt-10 rounded-3xl p-5">
        <ApplyWizard referralCode={access.referralCode} />
      </div>
    </PublicShell>
  );
}
