import { AdminShell } from "@/components/admin/admin-shell";
import { WeightsForm } from "@/components/admin/weights-form";
import { CurationForm } from "@/components/admin/curation-form";
import { brand } from "@/lib/config/site";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Matching weights", robots: { index: false } };

export default function MatchingAdminPage() {
  const store = getPreviewStore();
  return (
    <AdminShell title="Meridian Index">
      <p className="text-ivory-muted">{brand.matchingLine}</p>
      <p className="mt-2 text-sm text-ivory-dim">
        Saved weights are used immediately by The Meridian 10 and 100 in this preview.
        Human curation is labeled separately. Protected traits are never ranking factors.
      </p>
      <div className="mt-8">
        <WeightsForm weights={store.weights} />
      </div>
      <div className="mt-12">
        <p className="label">Human curation</p>
        <p className="mt-2 text-sm text-ivory-muted">Promote or suppress with a required reason.</p>
        <div className="mt-4">
          <CurationForm
            profiles={store.profiles}
            viewerId={store.viewerId}
            curation={store.curation}
          />
        </div>
      </div>
    </AdminShell>
  );
}
