import { LegalFrame } from "@/components/legal/frame";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Community standards" };

export default function CommunityPage() {
  return (
    <LegalFrame title="Community (placeholder)">
      <p>
        The house is small on purpose. Discretion, reciprocity, and care are
        expected. Reporting and blocking will be stewarded.
      </p>
      <p>{brand.soliciting}</p>
      <p>
        This is a placeholder pending counsel-approved standards. The no-soliciting
        rule is already a hard product rule: violation is a ban with no refund.
        Members may refer people into the house. You may mention your work only
        when someone is asking.
      </p>
    </LegalFrame>
  );
}
