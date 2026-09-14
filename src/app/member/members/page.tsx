import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { Directory } from "@/components/members/directory";
import { AskPanel } from "@/components/ask/ask-panel";
import { ASK_COPY } from "@/lib/matching/ask/types";
import { getPreviewStore } from "@/lib/preview/store";
import { visibleAskMembers } from "@/lib/matching/ask/score";

export const metadata = { title: "Members", robots: { index: false } };

export default async function MembersPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const profiles = visibleAskMembers(store.profiles, access.decision.isMemberAccess);

  return (
    <MemberShell user={access.user} demo title="Directory">
      <AskPanel
        intros={store.intros}
        variant="embed"
        openHouseIsolation={!access.decision.isMemberAccess}
      />
      <div className="editorial-rule my-10" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label">The house</p>
          <h2 className="mt-2 font-serif text-3xl">Directory</h2>
        </div>
        <Link
          href="/member/ask"
          className="min-h-11 text-[11px] tracking-[0.16em] uppercase text-gold"
        >
          {ASK_COPY.name}
        </Link>
      </div>
      <p className="mt-3 text-sm text-ivory-muted">
        Private, not indexed. Filters stay on this device. No real photographs.
        {access.decision.isMemberAccess
          ? ""
          : " Open House: SYNTHETIC DEMO only."}
      </p>
      <div className="mt-8">
        <Directory profiles={profiles} />
      </div>
    </MemberShell>
  );
}
