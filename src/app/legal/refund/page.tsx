import { LegalFrame } from "@/components/legal/frame";

export const metadata = { title: "Refund & cancellation" };

export default function RefundPage() {
  return (
    <LegalFrame title="Refund & cancellation (placeholder)">
      <p>
        Lifetime membership is $10,000, one time, through Stripe-hosted checkout.
        Broader cancellation and refund rules must be written by operators and
        counsel before the first live charge.
      </p>
      <p>
        One rule is already set: a ban for soliciting is without refund.
      </p>
    </LegalFrame>
  );
}
