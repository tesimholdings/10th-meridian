import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { CityHostsBoard } from "@/components/crossings/city-hosts-board";
import { canMutateCrossings } from "@/lib/crossings/privacy";
import { getPreviewStore } from "@/lib/preview/store";
import { CROSSINGS_COPY } from "@/lib/crossings/types";

export const metadata = { title: "City Hosts", robots: { index: false } };

export default async function CityHostsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  return (
    <MemberShell user={access.user} demo title={CROSSINGS_COPY.hosts}>
      <CityHostsBoard
        hosts={store.crossings.hosts}
        profiles={store.profiles}
        canMutate={canMutateCrossings(access.user?.role)}
      />
    </MemberShell>
  );
}
