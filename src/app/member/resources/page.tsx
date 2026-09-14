import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";

export const metadata = { title: "Resources", robots: { index: false } };

export default async function ResourcesPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell
      user={access.user}
      demo={!access.decision.isMemberAccess}
      title="Resources"
    >
      <div className="empty-state">
        <h1 className="font-serif">
          A library worth
          <br />
          <em className="text-gold">returning to.</em>
        </h1>
        <p className="mt-6 max-w-lg text-ivory-muted">
          The first collection is being curated. Member essays, perspectives,
          and useful discoveries will find their home here.
        </p>
        <Link href="/member/channels" className="quiet-link mt-6 text-gold">
          Join a conversation while you wait →
        </Link>
      </div>
    </MemberShell>
  );
}
