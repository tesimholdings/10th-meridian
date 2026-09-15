import { LegalFrame } from "@/components/legal/frame";
import { SOLICITING_BAN } from "@/lib/copy/community";
import { env } from "@/lib/env";

export const metadata = { title: "Refund & cancellation" };

export default function RefundPage() {
  return (
    <LegalFrame title={env.isProduction ? "Refund & cancellation" : "Refund & cancellation (placeholder)"}>
      <p>
        Lifetime membership is $10,000. Cancellation and ordinary refund rules
        must be confirmed before the first live charge.
      </p>
      <p>
        {SOLICITING_BAN} A ban for soliciting is without refund. Referrals remain welcome.
      </p>
      {env.isProduction ? null : (
        <p>Counsel has not signed this page.</p>
      )}
    </LegalFrame>
  );
}
