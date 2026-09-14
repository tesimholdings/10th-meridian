import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ChannelApp } from "@/components/channels/channel-app";

export const metadata = { title: "Channels", robots: { index: false } };

export default async function ChannelsPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Private member communication">
      <p className="mb-6 max-w-xl text-sm text-ivory-muted">
        Channels, DMs, threads, and attachments are intended to run on Stream Chat
        with server-side access checks. This preview shows an original mobile-first
        shell and labeled DEMO messages — not Slack, and not E2EE.
      </p>
      <ChannelApp />
    </MemberShell>
  );
}
