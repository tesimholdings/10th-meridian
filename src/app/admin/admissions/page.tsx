import { AdminShell } from "@/components/admin/admin-shell";
import { AdmissionsQueue } from "@/components/admin/admissions-queue";
import { acceptedThisCohort, getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Admissions", robots: { index: false } };

export default function AdmissionsPage() {
  const store = getPreviewStore();
  const accepted = acceptedThisCohort();
  return (
    <AdminShell title="Admissions">
      <AdmissionsQueue
        applications={store.applications}
        cap={store.admissionsCap}
        accepted={accepted}
        remaining={Math.max(0, store.admissionsCap - accepted)}
        cohortMonth={store.cohortMonth}
      />
    </AdminShell>
  );
}
