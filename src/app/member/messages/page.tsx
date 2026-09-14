import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { ChannelApp } from "@/components/channels/channel-app";
import { getPreviewStore, viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Messages", robots: { index: false } };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; to?: string }>;
}) {
  const access = await resolveAccessContext();
  const store = getPreviewStore();
  const viewer = viewerProfile();
  const params = await searchParams;
  return (
    <MemberShell user={access.user} demo title="Messages">
      <ChannelApp
        initialChannels={store.channels}
        initialMessages={store.messages}
        initialActiveId={params.channel}
        requestedProfileId={params.to}
        profiles={store.profiles}
        channelMembers={store.channelMembers}
        viewerId={viewer.id}
        viewerName={viewer.displayName}
      />
    </MemberShell>
  );
}
