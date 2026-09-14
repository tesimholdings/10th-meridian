import { redirect } from "next/navigation";
import { messageHref } from "@/lib/messaging/destination";

export default async function ChannelsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; to?: string }>;
}) {
  const params = await searchParams;
  redirect(messageHref({ profileId: params.to, channelId: params.channel }));
}
