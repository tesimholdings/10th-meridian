import { LegalFrame } from "@/components/legal/frame";

export const metadata = { title: "Refund & cancellation" };

export default function RefundPage() {
  return (
    <LegalFrame title="Refund & cancellation (placeholder)">
      <p>
        Billing will run through Stripe. Cancellation and refund rules must be
        written by operators and counsel before the first live charge. Do not
        invent a policy here.
      </p>
    </LegalFrame>
  );
}
