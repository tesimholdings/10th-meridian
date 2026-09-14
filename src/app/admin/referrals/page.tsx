import { AdminShell } from "@/components/admin/admin-shell";
import { ReferralDesk } from "@/components/admin/referral-desk";
import { getPreviewStore } from "@/lib/preview/store";
import { env } from "@/lib/env";

export const metadata = { title: "Referrals", robots: { index: false } };

export default function ReferralsAdminPage() {
  return (
    <AdminShell title="Referrals">
      <p className="text-ivory-muted">
        Unique codes, QR, and link tokens. A referral opens the door earlier. What
        happens next is still earned.
      </p>
      <div className="mt-8">
        <ReferralDesk referrals={getPreviewStore().referrals} siteUrl={env.siteUrl} />
      </div>
    </AdminShell>
  );
}
