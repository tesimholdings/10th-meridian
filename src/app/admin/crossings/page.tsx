import { AdminShell } from "@/components/admin/admin-shell";
import { TravelWeightsForm } from "@/components/admin/travel-weights-form";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Crossings weights", robots: { index: false } };

export default function AdminCrossingsPage() {
  const store = getPreviewStore();
  return (
    <AdminShell title="Crossings">
      <p className="text-ivory-muted">{CROSSINGS_COPY.line}</p>
      <p className="mt-2 text-sm text-ivory-dim">
        Travel-match weights are independent of The Meridian Index weights. Rankings never use
        wealth, popularity, follower count, protected characteristics, or message volume.
        City Notes require steward moderation with a written hide. Open House never receives real
        travel data.
      </p>
      <div className="mt-8">
        <TravelWeightsForm weights={store.crossings.travelWeights} />
      </div>
      <section className="mt-12">
        <p className="label">Moderation</p>
        <p className="mt-2 text-sm text-ivory-muted">
          City Notes reports hide a note after two reports. Stewards may hide immediately from
          the City Notes board. Exact table venues stay off the public card.
        </p>
      </section>
    </AdminShell>
  );
}
