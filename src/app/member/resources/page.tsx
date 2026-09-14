import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";

export const metadata = { title: "Resources", robots: { index: false } };

export default async function ResourcesPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Resources">
      <p className="text-ivory-muted">
        A quiet library for members. Content slots are empty pending editorial
        decisions — see SETUP.md.
      </p>
    </MemberShell>
  );
}
