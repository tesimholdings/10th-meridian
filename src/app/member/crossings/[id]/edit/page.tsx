import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { CoordinatesForm } from "@/components/crossings/coordinates-form";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Edit journey", robots: { index: false } };

export default async function EditJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const journey = store.crossings.journeys.find((j) => j.id === id);
  if (!journey || journey.profileId !== viewer.id) notFound();
  const canMutate = canMutateCrossings(access.user?.role);

  return (
    <MemberShell user={access.user} demo title="Edit coordinates">
      {canMutate ? (
        <CoordinatesForm
          channels={store.channels
            .filter(
              (channel) =>
                channel.kind === "public" || channel.kind === "chapter",
            )
            .map(({ id, name }) => ({ id, name }))}
          initial={journey}
          journeyId={journey.id}
        />
      ) : (
        <p className="text-sm text-ivory-muted">Active members only.</p>
      )}
    </MemberShell>
  );
}
