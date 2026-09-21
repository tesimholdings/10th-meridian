import "stream-chat";

declare module "stream-chat" {
  interface CustomChannelData {
    name?: string;
    topic?: string;
  }
  interface CustomMessageData {
    /** Set when this app already delivered Web Push, so the webhook does not send a second one. */
    tm_web_push?: "sent";
  }
  interface CustomUserData {
    tm_web_push?: Array<{
      endpoint: string;
      p256dh: string;
      auth: string;
    }>;
  }
}
