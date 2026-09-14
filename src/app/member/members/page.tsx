import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { Directory } from "@/components/members/directory";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Members", robots: { index: false } };

export default async function MembersPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo title="Directory">
      <p className="text-sm text-ivory-muted">
        Private, not indexed. Filters stay on this device. No real photographs.
      </p>
      <div className="mt-8">
        <Directory profiles={getPreviewStore().profiles} />
      </div>
    </MemberShell>
  );
}
