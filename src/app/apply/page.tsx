import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { Wordmark } from "@/components/brand/logo";
import { ApplyWizard } from "@/components/forms/apply-wizard";

export const metadata = { title: "Application", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const access = await resolveAccessContext();
  if (!access.decision.allowed && !access.decision.isMemberAccess) {
    redirect("/remind");
  }
  return (
    <div className="form-page safe-pad mx-auto min-h-dvh max-w-lg py-12">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">
        An application, not a form letter
      </h1>
      <p className="mt-3 text-sm text-ivory-muted">
        Selection is discretionary. Completeness helps. Nothing here guarantees
        a place. No more than ten new members are hand-selected each month.
      </p>
      <div className="mt-10">
        <ApplyWizard referralCode={access.referralCode} />
      </div>
    </div>
  );
}
