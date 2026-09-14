import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { getPreviewStore } from "@/lib/preview/store";
import { CoordinatesForm } from "@/components/crossings/coordinates-form";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { canMutateCrossings } from "@/lib/crossings/privacy";

export const metadata = {
  title: "Set Your Coordinates",
  robots: { index: false },
};

export default async function NewJourneyPage() {
  const access = await resolveAccessContext();
  const canMutate = canMutateCrossings(access.user?.role);
  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.createAction}>
      <h1 className="font-serif text-4xl">
        Where will life
        <br />
        <em className="text-gold">take you next?</em>
      </h1>
      <p className="mt-3 max-w-xl text-ivory-muted">
        City, dates, and how you wish to meet. Never a flight, a hotel stay, or
        a live pin.
      </p>
      <div className="crossings-form mt-8">
        {canMutate ? (
          <CoordinatesForm
            channels={getPreviewStore()
              .channels.filter(
                (channel) =>
                  channel.kind === "public" || channel.kind === "chapter",
              )
              .map(({ id, name }) => ({ id, name }))}
          />
        ) : (
          <p className="text-sm text-gold">
            Open House is demonstration only. Sign in as an active member to set
            coordinates.
          </p>
        )}
      </div>
    </MemberShell>
  );
}
