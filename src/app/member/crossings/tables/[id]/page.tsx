import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { TableActions } from "@/components/crossings/table-actions";
import { AttendanceRoster } from "@/components/events/attendance-roster";
import { OccasionFrame } from "@/components/events/occasion-frame";
import { faceFromProfile } from "@/lib/events/attendance";
import { journeyStillSrc } from "@/lib/atmosphere/resolve-campaign";
import { PrivacyNotice } from "@/components/crossings/states";
import { DemoMark } from "@/components/brand/demo-mark";
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
  const waiting = table.guests.filter((g) => g.status === "requested");
  const canMutate = canMutateCrossings(access.user?.role);
  const inChannel = confirmed.some((g) => g.profileId === viewer.id) || table.openedByProfileId === viewer.id;
  const canPromote =
    table.openedByProfileId === viewer.id ||
    access.user?.role === "administrator" ||
    access.user?.role === "moderator";
  const going = confirmed.flatMap((guest) => {
    const profile = store.profiles.find((person) => person.id === guest.profileId);
    return profile ? [faceFromProfile(profile)] : [];
  });
  const waitlist = waiting.flatMap((guest, index) => {
    const profile = store.profiles.find((person) => person.id === guest.profileId);
    return profile ? [faceFromProfile(profile, index + 1)] : [];
  });
  const when = new Date(table.dateTime).toLocaleString("en-GB", {
    timeZone: table.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <MemberShell user={access.user} demo title="Open a Table">
      <OccasionFrame
        src={journeyStillSrc({ destinationCity: table.city })}
        kicker={`${table.neighborhood} · ${table.mealType}`}
        title={table.theme ?? "A shared table"}
        place={table.city}
        when={`${when} · ${table.timezone}`}
        detail={`${confirmed.length}/${table.maxGuests} confirmed · ${table.joinMode === "request" ? "request to join" : "invitation only"}`}
        people={going}
        heading="h1"
      />
      {table.isDemo ? <div className="mt-4"><DemoMark /></div> : null}
      <p className="mt-4 text-sm text-ivory-dim">
        {table.venuePrivate
          ? `Venue: ${table.venuePrivate}`
          : "Exact venue is revealed only to confirmed participants."}
      </p>
      <PrivacyNotice />
      {inChannel && table.channelId ? (
        <Link
          href={`/member/messages?channel=${table.channelId}`}
          className="mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-gold"
        >
          Temporary private channel
        </Link>
      ) : (
        <p className="mt-4 text-sm text-ivory-dim">The private channel opens after you are confirmed.</p>
      )}
      <div className="reading mt-8">
        <AttendanceRoster going={going} waitlist={waitlist} canPromote={canPromote} tableId={table.id} />
      </div>
      <TableActions table={raw} viewerId={viewer.id} canMutate={canMutate} />
    </MemberShell>
  );
}
