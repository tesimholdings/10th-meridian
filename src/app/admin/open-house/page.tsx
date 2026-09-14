import { AdminShell } from "@/components/admin/admin-shell";
import { env } from "@/lib/env";

export const metadata = { title: "Open House schedule", robots: { index: false } };

export default function OpenHouseAdminPage() {
  return (
    <AdminShell title="Open House">
      <p className="text-ivory-muted">
        Server-calculated. The client clock is never used for access. Default
        timezone is America/Chicago.
      </p>
      <dl className="mt-8 grid gap-4">
        <Row label="Timezone" value={env.openHouseTimezone} />
        <Row label="Day" value={String(env.openHouseDay)} />
        <Row label="Referral hour" value={`${env.openHouseReferralHour}:00`} />
        <Row label="General hour" value={`${env.openHouseGeneralHour}:00`} />
        <Row label="Close" value={`${env.openHouseCloseHour}:00`} />
        <Row label="Force (env)" value={env.openHouseForce} />
      </dl>
      <p className="mt-8 text-sm text-ivory-dim">
        Persist edits to <code>site_config</code> after Supabase is connected.
      </p>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--line)] pb-3">
      <dt className="label">{label}</dt>
      <dd className="mt-1 font-serif text-2xl">{value}</dd>
    </div>
  );
}
