/** Conversation-scoped unsent drafts. Never share text across DMs, channels, or threads. */

export const MESSAGE_DRAFTS_KEY = "tm-message-drafts";

export function composeDraftId(channelId: string, threadId?: string | null): string {
  const channel = channelId.trim();
  const thread = (threadId ?? "").trim() || "root";
  return `${channel}::${thread}`;
}

export function parseDraftStore(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.length > 0) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

export function upsertDraft(
  store: Record<string, string>,
  id: string,
  body: string,
): Record<string, string> {
  const next = { ...store };
  if (!body.trim()) {
    delete next[id];
    return next;
  }
  next[id] = body;
  return next;
}

export function readDrafts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return parseDraftStore(window.sessionStorage.getItem(MESSAGE_DRAFTS_KEY));
}

export function persistDrafts(store: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MESSAGE_DRAFTS_KEY, JSON.stringify(store));
}

export function draftFor(
  store: Record<string, string>,
  channelId?: string | null,
  threadId?: string | null,
): string {
  if (!channelId?.trim()) return "";
  return store[composeDraftId(channelId, threadId)] ?? "";
}
