import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";

export const metadata = { title: "Settings", robots: { index: false } };

export default async function SettingsPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Settings">
      <ul className="grid gap-4 text-ivory-muted">
        <li>Notifications — Stream + email (Resend) when keys are live.</li>
        <li>Privacy — members / matches only / hidden.</li>
        <li>Availability — open, selective, limited, paused.</li>
        <li>Blocks and reports — server-enforced.</li>
      </ul>
    </MemberShell>
  );
}
