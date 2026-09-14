import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { TableActions } from "@/components/crossings/table-actions";
import { PrivacyNotice } from "@/components/crossings/states";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { publicTableView } from "@/lib/crossings/service";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "A table", robots: { index: false } };

export default async function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const raw = store.crossings.tables.find((t) => t.id === id);
  if (!raw) notFound();
  const table = publicTableView(raw, viewer.id, access.user?.role ?? null);
  const confirmed = table.guests.filter((g) => g.status === "confirmed");
  const canMutate = canMutateCrossings(access.user?.role);
  const inChannel = confirmed.some((g) => g.profileId === viewer.id) || table.openedByProfileId === viewer.id;

  return (
    <MemberShell user={access.user} demo title="Open a Table">
      <p className="label">
        {table.city} · {table.neighborhood}
        {table.isDemo ? " · SYNTHETIC DEMO" : ""}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{table.theme ?? "A shared table"}</h1>
      <p className="mt-3 text-ivory-muted">
        {table.mealType} · {table.dateTime} · {table.timezone}
      </p>
      <p className="mt-3 text-sm text-ivory-muted">
        {confirmed.length}/{table.maxGuests} confirmed · {table.joinMode === "request" ? "request to join" : "invitation only"}
      </p>
      <p className="mt-4 text-sm text-ivory-dim">
        {table.venuePrivate
          ? `Venue: ${table.venuePrivate}`
          : "Exact venue is revealed only to confirmed participants."}
      </p>
      <PrivacyNotice />
      {inChannel && table.channelId ? (
        <Link
          href={`/member/channels?channel=${table.channelId}`}
          className="mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-gold"
        >
          Temporary private channel
        </Link>
      ) : (
        <p className="mt-4 text-sm text-ivory-dim">The private channel opens after you are confirmed.</p>
      )}
      <TableActions table={raw} viewerId={viewer.id} canMutate={canMutate} />
    </MemberShell>
  );
}
