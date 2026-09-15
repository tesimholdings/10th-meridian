import { env, hasStream } from "@/lib/env";
import { getStreamServer } from "@/lib/stream/client";

export type StreamTokenResult = {
  ok: true;
  stub: boolean;
  token: string | null;
  apiKey: string | null;
  userId?: string;
  note?: string;
};

/**
 * Server-side Stream user token for DMs and Channels.
 * Missing keys return a labeled demo stub — never invent a live token.
 */
export function issueStreamToken(userId: string): StreamTokenResult {
  const stream = getStreamServer();
  if (!stream || !userId) {
    return {
      ok: true,
      stub: true,
      token: null,
      apiKey: env.streamApiKey || null,
      userId,
      note: "Stream token issuance is stubbed until NEXT_PUBLIC_STREAM_API_KEY and STREAM_API_SECRET are set.",
    };
  }
  return {
    ok: true,
    stub: false,
    token: stream.createToken(userId),
    apiKey: env.streamApiKey,
    userId,
  };
}

export function streamReady(): boolean {
  return hasStream();
}
