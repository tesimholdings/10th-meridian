import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ChannelApp } from "@/components/channels/channel-app";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Channels", robots: { index: false } };

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const params = await searchParams;
  return (
    <MemberShell user={access.user} demo title="Private member communication">
      <h1 className="font-serif">
        Conversations
        <br />
        <em className="text-gold">with possibility.</em>
      </h1>
      <p className="mt-5 mb-6 max-w-xl text-sm text-ivory-muted">
        A place to exchange ideas, ask generously, and connect. Messages in this
        preview are synthetic DEMO conversations.
      </p>
      <ChannelApp
        key={params.channel ?? "house"}
        initialChannels={store.channels}
        initialMessages={store.messages}
        initialActiveId={params.channel}
      />
    </MemberShell>
  );
}
