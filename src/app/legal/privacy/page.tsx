import { LegalFrame } from "@/components/legal/frame";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalFrame title="Privacy (placeholder)">
      <p>
        10th Meridian treats member profiles, messages, applications, and payment
        references as private. Authenticated surfaces are marked noindex. This
        page is a placeholder pending counsel.
      </p>
      <p>
        We intend to collect account data, application materials, structured
        matching fields, referral metadata, and Stripe customer/subscription IDs
        — never card numbers. Stream Chat will process member communications
        under its terms once enabled.
      </p>
    </LegalFrame>
  );
}
