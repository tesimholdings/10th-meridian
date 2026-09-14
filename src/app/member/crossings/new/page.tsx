import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { CoordinatesForm } from "@/components/crossings/coordinates-form";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { canMutateCrossings } from "@/lib/crossings/privacy";

export const metadata = { title: "Set Your Coordinates", robots: { index: false } };

export default async function NewJourneyPage() {
  const access = await resolveAccessContext();
  const canMutate = canMutateCrossings(access.user?.role);
  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.createAction}>
      <h1 className="font-serif text-4xl leading-tight">{CROSSINGS_COPY.line}</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-ivory-muted">
        City, dates, and how you wish to meet. Never a flight, a hotel stay, or a live pin.
      </p>
      <div className="mt-8">
        {canMutate ? (
          <CoordinatesForm />
        ) : (
          <p className="text-sm text-gold">
            Open House is demonstration only. Sign in as an active member to set coordinates.
          </p>
        )}
      </div>
    </MemberShell>
  );
}
