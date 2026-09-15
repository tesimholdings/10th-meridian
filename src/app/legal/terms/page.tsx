import { LegalFrame } from "@/components/legal/frame";
import { SOLICITING_BAN } from "@/lib/copy/community";
import { env } from "@/lib/env";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalFrame title={env.isProduction ? "Terms" : "Terms (placeholder)"}>
      <p>
        Membership is selective and discretionary. A complete application, a
        referral, or early Open House entry does not guarantee acceptance.
        No more than ten new members are hand-selected each month.
      </p>
      <p>
        Lifetime membership is $10,000. Monthly billing is not offered.
        {` ${SOLICITING_BAN}`} A ban for soliciting is without refund.
      </p>
      {env.isProduction ? null : (
        <p>
          Counsel has not signed this page. Prepared domain: tenmeridian.com.
        </p>
      )}
    </LegalFrame>
  );
}
