import { LegalFrame } from "@/components/legal/frame";
import { SOLICITING_BAN } from "@/lib/copy/community";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalFrame title="Terms (placeholder)">
      <p>
        Membership is selective and discretionary. A complete application, a
        referral, or early Open House entry does not guarantee acceptance.
        No more than ten new members are hand-selected each month.
      </p>
      <p>
        Lifetime membership is $10,000. Monthly billing is not offered yet.
        {` ${SOLICITING_BAN}`} A ban for soliciting is without refund.
      </p>
      <p>
        Replace this placeholder with counsel-approved terms before any public
        launch. See SETUP.md. Prepared domain: tenmeridian.com (not purchased).
      </p>
    </LegalFrame>
  );
}
