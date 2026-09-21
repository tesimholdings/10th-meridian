import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { publicTableView } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/crossings/states";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { OccasionFrame } from "@/components/events/occasion-frame";
import { journeyStillSrc } from "@/lib/atmosphere/resolve-campaign";
import { faceFromProfile } from "@/lib/events/attendance";

export const metadata = { title: "Tables", robots: { index: false } };

export default async function TablesPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const canMutate = canMutateCrossings(access.user?.role);
  const tables = store.crossings.tables.map((t) => publicTableView(t, viewer.id, access.user?.role ?? null));

  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.table}>
      <p className="max-w-xl text-ivory-muted">
        A private group meal when paths overlap. Neighborhood in public; exact venue only after confirmation.
      </p>
      {canMutate ? (
        <div className="mt-6">
          <Button href="/member/crossings/tables/new">Open a Table</Button>
        </div>
      ) : null}
      {tables.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No tables are set."
            body="When paths overlap, a member may open a private table — neighborhood first, venue only after confirmation."
            action={
              canMutate ? <Button href="/member/crossings/tables/new">Open a Table</Button> : undefined
            }
          />
        </div>
      ) : (
      <ul className="occasion-grid mt-8">
        {tables.map((t) => {
          const confirmed = t.guests.filter((g) => g.status === "confirmed");
          const going = confirmed.flatMap((guest) => {
            const profile = store.profiles.find((person) => person.id === guest.profileId);
            return profile ? [faceFromProfile(profile)] : [];
          });
          const when = new Date(t.dateTime).toLocaleString("en-GB", {
            timeZone: t.timezone,
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <li key={t.id}>
              <OccasionFrame
                href={`/member/crossings/tables/${t.id}`}
                src={journeyStillSrc({ destinationCity: t.city })}
                kicker={`${t.neighborhood} · ${t.mealType}`}
                title={t.theme ?? "A shared table"}
                place={t.city}
                when={when}
                detail={
                  t.venuePrivate
                    ? "Venue visible to you."
                    : "Exact venue withheld until you are confirmed."
                }
                people={going}
              />
            </li>
          );
        })}
      </ul>
      )}
    </MemberShell>
  );
}
