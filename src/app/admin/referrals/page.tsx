import { AdminShell } from "@/components/admin/admin-shell";
import { demoReferrals } from "@/lib/data/demo";
import { env } from "@/lib/env";

export const metadata = { title: "Referrals", robots: { index: false } };

export default function ReferralsAdminPage() {
  return (
    <AdminShell title="Referrals">
      <p className="text-ivory-muted">
        Unique codes, QR, and link tokens. TEST-ONLY codes below. QR:
        {` ${env.siteUrl}/api/referrals/qr?code=TENTH-EARLY`}
      </p>
      <ul className="mt-8 grid gap-3">
        {demoReferrals.map((r) => (
          <li key={r.id} className="border border-[var(--line)] p-4">
            <p className="font-serif text-2xl">{r.code}</p>
            <p className="text-sm text-ivory-muted">
              {r.label} · {r.useCount}/{r.maxUses}
              {r.revokedAt ? " · revoked" : ""}
              {r.expiresAt ? " · expirable" : ""}
            </p>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
