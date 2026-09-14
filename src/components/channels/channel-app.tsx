"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChannelRecord, MessageRecord } from "@/lib/data/types";

export function ChannelApp({
  initialChannels,
  initialMessages,
  initialActiveId,
}: {
  initialChannels: ChannelRecord[];
  initialMessages: MessageRecord[];
  initialActiveId?: string;
}) {
  const [channels, setChannels] = useState(initialChannels);
  const [messages, setMessages] = useState(initialMessages);
  const dialog = useRef<HTMLDialogElement>(null);
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(
    initialActiveId && initialChannels.some((c) => c.id === initialActiveId)
      ? initialActiveId
      : initialChannels[1]?.id ?? initialChannels[0]?.id,
  );
  const [threadOf, setThreadOf] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draftKey = `${active}:${threadOf ?? "channel"}`;
  const draft = drafts[draftKey] ?? "";
  const setDraft = (value: string) =>
    setDrafts((previous) => ({ ...previous, [draftKey]: value }));
  const [streamNote, setStreamNote] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/stream/token", { method: "POST" })
      .then((r) => r.json())
      .then(() =>
        setStreamNote(
          "Preview conversations · DEMO only · Not end-to-end encrypted.",
        ),
      )
      .catch(() =>
        setStreamNote(
          "Preview conversations · DEMO only · Not end-to-end encrypted.",
        ),
      );
  }, []);

  const channel = channels.find((c) => c.id === active) ?? channels[0];
  const roots = useMemo(
    () => messages.filter((m) => m.channelId === active && !m.parentId),
    [messages, active],
  );
  const thread = useMemo(
    () => messages.filter((m) => m.parentId === threadOf),
    [messages, threadOf],
  );

  async function send() {
    if (!draft.trim() || !channel || sending.current) return;
    sending.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          channelId: channel.id,
          body: draft,
          parentId: threadOf ?? undefined,
        }),
      });
      const json = (await res.json()) as { messages?: MessageRecord[] };
      if (!res.ok || !json.messages) throw new Error("send");
      setMessages(json.messages);
      setDrafts((previous) => ({ ...previous, [draftKey]: "" }));
    } catch {
      setError(
        "Your message wasn’t sent. Your draft is safe here—please try again.",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  async function react(messageId: string, reaction: string) {
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "react", messageId, reaction }),
      });
      const json = (await res.json()) as { message?: MessageRecord };
      if (!res.ok) throw new Error("reaction");
      if (json.message) {
        setMessages((list) =>
          list.map((m) => (m.id === json.message!.id ? json.message! : m)),
        );
      }
    } catch {
      setError("That reaction couldn’t be saved. Please try again.");
    }
  }

  async function openChannel(id: string) {
    setActive(id);
    dialog.current?.close();
    setThreadOf(null);
    try {
      const result = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", channelId: id }),
      });
      if (!result.ok) throw new Error("read");
      setChannels((list) =>
        list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
      );
    } catch {
      setError("Messages are available, but the read status couldn’t update.");
    }
  }

  return (
    <div className="channel-app relative">
      <div className="channel-heading flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <button
          type="button"
          className="min-h-11 text-left text-[11px] tracking-[0.2em] uppercase text-gold"
          onClick={() => dialog.current?.showModal()}
          aria-haspopup="dialog"
        >
          All channels ↗
        </button>
        <div>
          <p className="font-serif text-xl">#{channel?.slug}</p>
          <p className="text-[11px] text-ivory-dim">{channel?.topic}</p>
        </div>
      </div>

      <dialog
        ref={dialog}
        className="channel-dialog"
        aria-labelledby="channel-dialog-title"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex items-center justify-between gap-4 pb-4">
          <h2 id="channel-dialog-title" className="font-serif text-3xl">
            Rooms in the house
          </h2>
          <button
            type="button"
            className="quiet-link"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <ul>
          {channels.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                aria-current={active === c.id ? "true" : undefined}
                onClick={() => void openChannel(c.id)}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left text-sm"
              >
                <span>#{c.slug}</span>
                {c.unread ? (
                  <span
                    className="text-gold"
                    aria-label={`${c.unread} unread messages`}
                  >
                    {c.unread}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </dialog>

      <div className="channel-messages min-h-[38vh] space-y-7">
        {(threadOf ? thread : roots).length === 0 ? (
          <p className="text-sm text-ivory-dim">
            {threadOf
              ? "No replies yet."
              : "Be the first to start a thoughtful conversation. Messages in this preview are DEMO only."}
          </p>
        ) : (
          (threadOf ? thread : roots).map((m) => (
            <article
              key={m.id}
              className="channel-message grid grid-cols-[auto_minmax(0,1fr)] gap-3"
            >
              <div className="member-avatar flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[11px]">
                {m.authorInitials}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.16em] uppercase text-gold">
                  {m.authorName} · DEMO
                </p>
                <p className="mt-1 text-[15px] leading-relaxed">{m.body}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["acknowledge", "raise", "hold"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => void react(m.id, r)}
                      className="min-h-9 border border-[var(--line)] px-2 text-[10px] tracking-[0.14em] uppercase text-ivory-dim"
                    >
                      {r}
                      {m.reactions?.[r]?.length
                        ? ` ${m.reactions[r].length}`
                        : ""}
                    </button>
                  ))}
                  {!threadOf ? (
                    <button
                      type="button"
                      className="min-h-9 text-[10px] tracking-[0.14em] uppercase text-gold"
                      onClick={() => setThreadOf(m.id)}
                    >
                      Thread {m.threadCount ? `(${m.threadCount})` : ""}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
        {threadOf ? (
          <button
            type="button"
            className="text-[11px] uppercase tracking-[0.16em] text-gold"
            onClick={() => setThreadOf(null)}
          >
            Back to channel
          </button>
        ) : null}
      </div>

      <form
        className="channel-composer grid grid-cols-[minmax(0,1fr)_auto] gap-2 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          rows={2}
          disabled={busy}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            threadOf
              ? "Add a thoughtful reply…"
              : `Message #${channel?.slug ?? "the house"}…`
          }
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim() || !channel}
          aria-label={busy ? "Sending message" : "Send message"}
          className="min-h-12 px-4 text-[11px] tracking-[0.18em] uppercase text-gold"
        >
          {busy ? "…" : "↑"}
        </button>
      </form>
      {error ? (
        <p
          role="alert"
          className="status-message mt-3 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}
      <p className="px-4 py-3 text-[11px] text-ivory-dim">
        {streamNote ??
          "Private member communication, not end-to-end encryption."}
      </p>
    </div>
  );
}
