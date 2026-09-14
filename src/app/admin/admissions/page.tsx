import { AdminShell } from "@/components/admin/admin-shell";
import { demoApplications } from "@/lib/data/demo";
import { env } from "@/lib/env";

export const metadata = { title: "Admissions", robots: { index: false } };

export default function AdmissionsPage() {
  return (
    <AdminShell title="Admissions">
      <p className="text-ivory-muted">
        Cohort cap {env.admissionsCap}. When the month is full, further approvals
        are blocked unless a steward sets an override and moves others to the next
        cohort or waitlist. Selection is human — no algorithm grants membership.
      </p>
      <ul className="mt-8 grid gap-4">
        {demoApplications.map((a) => (
          <li key={a.id} className="border border-[var(--line)] p-4">
            <p className="font-serif text-2xl">{a.fullName}</p>
            <p className="text-sm text-ivory-muted">
              {a.status.replaceAll("_", " ")} · {a.city} · DEMO
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] tracking-[0.14em] uppercase">
              <span className="border border-[var(--line)] px-2 py-1">Under Review</span>
              <span className="border border-[var(--line)] px-2 py-1">Approve (if cap)</span>
              <span className="border border-[var(--line)] px-2 py-1">Waitlist</span>
              <span className="border border-[var(--line)] px-2 py-1">Decline</span>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
