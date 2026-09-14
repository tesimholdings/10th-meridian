import { LegalFrame } from "@/components/legal/frame";
import { SOLICITING_BAN } from "@/lib/copy/community";

export const metadata = { title: "Refund & cancellation" };

export default function RefundPage() {
  return (
    <LegalFrame title="Refund & cancellation (placeholder)">
      <p>
        Billing will run through Stripe. Lifetime membership is $10,000.
        Cancellation and ordinary refund rules must be written by operators and
        counsel before the first live charge.
      </p>
      <p>
        {SOLICITING_BAN} A ban for soliciting is without refund. Referrals remain welcome.
      </p>
    </LegalFrame>
  );
}
