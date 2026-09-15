import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";

export const metadata = { title: "Resources", robots: { index: false } };

export default async function ResourcesPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Resources" hasHeading>
      <h1 className="font-serif text-4xl">Resources</h1>
      <p className="mt-4 max-w-xl text-[var(--navy-soft)]">
        The member library is empty. Steward-edited notes will appear here when they exist.
      </p>
    </MemberShell>
  );
}
