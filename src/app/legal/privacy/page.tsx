import { LegalFrame } from "@/components/legal/frame";
import { env } from "@/lib/env";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalFrame title={env.isProduction ? "Privacy" : "Privacy (placeholder)"}>
      <p>
        10th Meridian treats member profiles, messages, applications, and payment
        references as private. Authenticated surfaces are marked noindex. Member
        profiles are never public and never indexed.
      </p>
      <p>
        We intend to collect account data, application materials, structured
        matching fields, referral metadata, and Stripe customer/subscription IDs
        — never card numbers. Stream Chat will process member communications
        under its terms once enabled. Messages are not end-to-end encrypted.
      </p>
      <p>
        Location is city-level only. Optional profile fields (website, LinkedIn,
        gallery, offers, needs, strengths, events) have member privacy controls.
      </p>
      {env.isProduction ? null : (
        <p>
          Open House listings on this preview are editorial. Counsel has not signed
          this page.
        </p>
      )}
    </LegalFrame>
  );
}
