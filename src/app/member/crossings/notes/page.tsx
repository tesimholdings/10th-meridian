import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { CityNotesBoard } from "@/components/crossings/city-notes-board";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { visibleCityNotes } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { CROSSINGS_COPY } from "@/lib/crossings/types";

export const metadata = { title: "City Notes", robots: { index: false } };

export default async function CityNotesPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const notes = visibleCityNotes(store.crossings, access.decision.isMemberAccess);
  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.notes}>
      <p className="max-w-xl text-ivory-muted">
        A private member-curated city guide. Never public. Never Open House as real data.
      </p>
      <div className="mt-8">
        <CityNotesBoard
          notes={notes}
          profiles={store.profiles}
          viewerId={viewer.id}
          canMutate={canMutateCrossings(access.user?.role)}
          isStaff={access.user?.role === "administrator" || access.user?.role === "moderator"}
        />
      </div>
    </MemberShell>
  );
}
