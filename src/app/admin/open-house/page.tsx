import { AdminShell } from "@/components/admin/admin-shell";
import { OpenHouseForm } from "@/components/admin/open-house-form";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Open House schedule", robots: { index: false } };

export default function OpenHouseAdminPage() {
  const config = getPreviewStore().openHouse;
  return (
    <AdminShell title="Open House">
      <p className="text-ivory-muted">
        Server-calculated. The client clock is never used for access. Edits persist
        on the preview site_config path until the process restarts.
      </p>
      <div className="mt-8">
        <OpenHouseForm config={config} />
      </div>
    </AdminShell>
  );
}
