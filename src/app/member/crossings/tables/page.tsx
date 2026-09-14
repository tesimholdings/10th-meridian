import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { publicTableView } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";
import { CROSSINGS_COPY } from "@/lib/crossings/types";
import { Button } from "@/components/ui/button";
import { DemoMark } from "@/components/brand/demo-mark";
import { EmptyState } from "@/components/crossings/states";
import { canMutateCrossings } from "@/lib/crossings/privacy";

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
      <ul className="mt-8 grid gap-4">
        {tables.map((t) => (
          <li key={t.id}>
            <Link href={`/member/crossings/tables/${t.id}`} className="panel block p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="label">
                  {t.city} · {t.neighborhood} · {t.mealType}
                </p>
                {t.isDemo ? <DemoMark /> : null}
              </div>
              <p className="mt-2 font-serif text-2xl">{t.theme ?? "A shared table"}</p>
              <p className="mt-2 text-sm text-ivory-muted">
                {new Date(t.dateTime).toLocaleString("en-GB", {
                  timeZone: t.timezone,
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {t.guests.filter((g) => g.status === "confirmed").length}/{t.maxGuests} confirmed
              </p>
              <p className="mt-2 text-sm text-ivory-dim">
                {t.venuePrivate ? "Venue visible to you." : "Exact venue withheld until you are confirmed."}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </MemberShell>
  );
}
