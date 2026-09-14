import { LegalFrame } from "@/components/legal/frame";
import { COMMUNITY_STANDARD, SOLICITING_BAN, SOLICITING_MENTION, SOLICITING_REFERRALS } from "@/lib/copy/community";

export const metadata = { title: "Community standards" };

export default function CommunityPage() {
  return (
    <LegalFrame title="Community (placeholder)">
      <p>
        The house is small on purpose. Discretion, reciprocity, and care are
        expected. Reporting and blocking will be stewarded.
      </p>
      <p>
        <strong className="text-ivory">Absolutely no soliciting. Ban with no refund.</strong>{" "}
        {SOLICITING_REFERRALS} {SOLICITING_MENTION}
      </p>
      <p>{SOLICITING_BAN}</p>
      <p>{COMMUNITY_STANDARD}</p>
      <p>
        This page remains a placeholder pending counsel. The no-soliciting rule
        is already the operating standard of the house.
      </p>
    </LegalFrame>
  );
}
