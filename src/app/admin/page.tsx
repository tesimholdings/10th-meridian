import { AdminShell } from "@/components/admin/admin-shell";
import { demoApplications, demoAudit } from "@/lib/data/demo";
import { env, integrationStatus } from "@/lib/env";

export const metadata = { title: "Steward desk", robots: { index: false } };

export default function AdminHomePage() {
  const integrations = integrationStatus();
  return (
    <AdminShell title="Overview">
      <h1 className="font-serif text-4xl">The desk is quiet.</h1>
      <p className="mt-3 text-ivory-muted">
        Monthly cap: {env.admissionsCap}. Marketed as “no more than ten.” Internally,
        up to ten unless a steward overrides.
      </p>
      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <Card label="Applications (DEMO)" value={String(demoApplications.length)} />
        <Card label="Supabase" value={integrations.supabase ? "connected" : "stub"} />
        <Card label="Stripe" value={integrations.stripe ? "keys present" : "stub"} />
      </section>
      <section className="mt-10">
        <p className="label">Activity (DEMO)</p>
        <ul className="mt-3 text-sm text-ivory-muted">
          {demoAudit.map((a) => (
            <li key={a.id}>
              {a.action} · {a.entity}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line)] p-4">
      <p className="label">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
