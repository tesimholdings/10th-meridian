"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [open, setOpen] = useState(Boolean(initialActiveId));
  const [active, setActive] = useState(
    initialActiveId && initialChannels.some((c) => c.id === initialActiveId)
      ? initialActiveId
      : initialChannels[1]?.id ?? initialChannels[0]?.id,
  );
  const [threadOf, setThreadOf] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [streamNote, setStreamNote] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/stream/token", { method: "POST" })
      .then((r) => r.json())
      .then((json: { stub?: boolean }) => {
        setStreamNote(
          json.stub
            ? "DEMO state — Stream keys are not present. Private member communication, not E2EE."
            : "Stream token issued. This shell still uses labeled DEMO messages until channels are mapped live.",
        );
      })
      .catch(() => setStreamNote("DEMO state. Private member communication, not E2EE."));
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
    if (!draft.trim() || !channel) return;
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
    if (json.messages) setMessages(json.messages);
    setDraft("");
  }

  async function react(messageId: string, reaction: string) {
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", messageId, reaction }),
    });
    const json = (await res.json()) as { message?: MessageRecord };
    if (json.message) {
      setMessages((list) => list.map((m) => (m.id === json.message!.id ? json.message! : m)));
    }
  }

  async function openChannel(id: string) {
    setActive(id);
    setOpen(false);
    setThreadOf(null);
    await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", channelId: id }),
    });
    setChannels((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  return (
    <div className="relative border border-[var(--line)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <button
          type="button"
          className="min-h-11 text-left text-[11px] tracking-[0.2em] uppercase text-gold"
          onClick={() => setOpen(true)}
        >
          Channels
        </button>
        <div>
          <p className="font-serif text-xl">#{channel?.slug}</p>
          <p className="text-[11px] text-ivory-dim">{channel?.topic}</p>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-0 z-20 flex">
          <aside className="w-[82%] max-w-sm overflow-y-auto border-r border-[var(--line)] bg-ink">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="label">House channels</p>
              <button type="button" className="min-h-11 text-sm" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <ul>
              {channels.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => void openChannel(c.id)}
                    className="flex min-h-12 w-full items-center justify-between px-4 text-left text-sm"
                  >
                    <span>#{c.slug}</span>
                    {c.unread ? <span className="text-gold">{c.unread}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <button className="flex-1 bg-black/50" onClick={() => setOpen(false)} aria-label="Close drawer" />
        </div>
      ) : null}

      <div className="min-h-[48vh] space-y-4 px-4 py-5">
        {(threadOf ? thread : roots).length === 0 ? (
          <p className="text-sm text-ivory-dim">
            {threadOf ? "No replies yet." : "No DEMO messages in this channel."}
          </p>
        ) : (
          (threadOf ? thread : roots).map((m) => (
            <article key={m.id} className="grid grid-cols-[auto_1fr] gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[11px]">
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
                      {m.reactions?.[r]?.length ? ` ${m.reactions[r].length}` : ""}
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
          <button type="button" className="text-[11px] uppercase tracking-[0.16em] text-gold" onClick={() => setThreadOf(null)}>
            Back to channel
          </button>
        ) : null}
      </div>

      <form
        className="sticky bottom-0 grid grid-cols-[1fr_auto] gap-2 border-t border-[var(--line)] bg-void p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            threadOf
              ? "Reply in thread — DEMO. No soliciting."
              : "Write to the house — DEMO. No soliciting; mention yourself only if asked."
          }
          aria-label="Message"
        />
        <button type="submit" className="min-h-12 px-4 text-[11px] tracking-[0.18em] uppercase text-gold">
          Send
        </button>
      </form>
      <p className="px-4 pb-3 text-[11px] text-ivory-dim">
        {streamNote ??
          "Private member communication, not end-to-end encryption. Absolutely no soliciting — ban without refund."}
      </p>
    </div>
  );
}
