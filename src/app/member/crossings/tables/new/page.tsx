import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { TableForm } from "@/components/crossings/table-form";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { CROSSINGS_COPY } from "@/lib/crossings/types";

export const metadata = { title: "Open a Table", robots: { index: false } };

export default async function NewTablePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; country?: string }>;
}) {
  const access = await resolveAccessContext();
  const params = await searchParams;
  const canMutate = canMutateCrossings(access.user?.role);
  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.table}>
      {canMutate ? (
        <TableForm defaultCity={params.city} defaultCountry={params.country} />
      ) : (
        <p className="text-sm text-gold">Open House is demonstration only.</p>
      )}
    </MemberShell>
  );
}
