import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ChannelApp } from "@/components/channels/channel-app";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Channels", robots: { index: false } };

export default async function ChannelsPage() {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  return (
    <MemberShell user={access.user} demo title="Private member communication">
      <p className="mb-6 max-w-xl text-sm text-ivory-muted">
        Channels, DMs, threads, and attachments are intended to run on Stream Chat
        with server-side access checks. Compose, reactions, threads, and unreads
        update DEMO state here. Not Slack. Not E2EE.
      </p>
      <ChannelApp initialChannels={store.channels} initialMessages={store.messages} />
    </MemberShell>
  );
}
