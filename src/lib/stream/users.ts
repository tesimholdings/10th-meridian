import { getStreamServer } from "@/lib/stream/client";

type StreamUpserter = {
  upsertUsers?: (users: { id: string; name?: string }[]) => Promise<unknown>;
  upsertUser?: (user: { id: string; name?: string }) => Promise<unknown>;
};

/**
 * Stream user id matches the member session id (account id) so DM tokens line up.
 * Missing keys skip quietly — sign-in does not depend on chat.
 */
export async function upsertStreamMember(input: {
  id: string;
  name: string;
}): Promise<"upserted" | "skipped"> {
  if (!input.id) return "skipped";
  const stream = getStreamServer() as StreamUpserter | null;
  if (!stream) return "skipped";
  const user = { id: input.id, name: input.name };
  if (typeof stream.upsertUsers === "function") {
    await stream.upsertUsers([user]);
    return "upserted";
  }
  if (typeof stream.upsertUser === "function") {
    await stream.upsertUser(user);
    return "upserted";
  }
  return "skipped";
}
