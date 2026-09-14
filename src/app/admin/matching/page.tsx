import { AdminShell } from "@/components/admin/admin-shell";
import { DEFAULT_WEIGHTS } from "@/lib/matching/types";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Matching weights", robots: { index: false } };

const rows = [
  ["complementary", "Reciprocal value / complementary ask-offer", DEFAULT_WEIGHTS.complementary],
  ["goals", "Relevance to stated goals", DEFAULT_WEIGHTS.goals],
  ["interests", "Shared interests / values", DEFAULT_WEIGHTS.interests],
  ["industry", "Industry relevance or useful adjacency", DEFAULT_WEIGHTS.industry],
  ["geography", "Geographic / travel compatibility", DEFAULT_WEIGHTS.geography],
  ["preferences", "Connection preferences / availability", DEFAULT_WEIGHTS.preferences],
  ["novelty", "Network novelty / cross-pollination", DEFAULT_WEIGHTS.novelty],
] as const;

export default function MatchingAdminPage() {
  return (
    <AdminShell title="Meridian Index">
      <p className="text-ivory-muted">{brand.matchingLine}</p>
      <p className="mt-2 text-sm text-ivory-dim">
        Weights persist in <code>matching_weights</code> once Supabase is live.
        Human curation is stored separately and labeled in the member UI.
      </p>
      <form className="mt-8 grid gap-4">
        {rows.map(([key, label, value]) => (
          <label key={key} className="grid gap-2">
            <span className="label">{label}</span>
            <input name={key} defaultValue={String(value)} inputMode="decimal" />
          </label>
        ))}
        <p className="text-[12px] text-ivory-dim">
          Saving is wired after Supabase. Protected traits are not fields and must
          never be added as ranking factors.
        </p>
      </form>
    </AdminShell>
  );
}
