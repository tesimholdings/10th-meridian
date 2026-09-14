import { StreamChat } from "stream-chat";
import { env, hasStream } from "@/lib/env";

export function getStreamServer(): StreamChat | null {
  if (!hasStream()) return null;
  return StreamChat.getInstance(env.streamApiKey, env.streamApiSecret);
}

export function streamMode() {
  return hasStream() ? "live-keys-present" : "stub";
}
