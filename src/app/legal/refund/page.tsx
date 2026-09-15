import { LegalFrame } from "@/components/legal/frame";
import { SOLICITING_BAN } from "@/lib/copy/community";
import { env } from "@/lib/env";

export const metadata = { title: "Refund & cancellation" };

export default function RefundPage() {
  return (
    <LegalFrame title={env.isProduction ? "Refund & cancellation" : "Refund & cancellation (placeholder)"}>
      <p>
        Founding Ten: $5,000 once. After Founding Ten: $10,000 entry plus $195/month.
        Canceling monthly dues ends the seat. Rejoining requires the $10,000 entry again.
        Ordinary refund rules must be confirmed before the first live charge.
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
