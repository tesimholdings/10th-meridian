"use client";

import { useMemo, useState } from "react";
import { demoChannels, demoMessages } from "@/lib/data/demo";

export function ChannelApp() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(demoChannels[1].id);
  const [draft, setDraft] = useState("");
  const channel = demoChannels.find((c) => c.id === active) ?? demoChannels[0];
  const messages = useMemo(
    () => demoMessages.filter((m) => m.channelId === active),
    [active],
  );

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
          <p className="font-serif text-xl">#{channel.slug}</p>
          <p className="text-[11px] text-ivory-dim">{channel.topic}</p>
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
              {demoChannels.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(c.id);
                      setOpen(false);
                    }}
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

      <div className="min-h-[50vh] space-y-4 px-4 py-5">
        {messages.length === 0 ? (
          <p className="text-sm text-ivory-dim">No DEMO messages in this channel.</p>
        ) : (
          messages.map((m) => (
            <article key={m.id} className="grid grid-cols-[auto_1fr] gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[11px]">
                {m.authorInitials}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.16em] uppercase text-gold">
                  {m.authorName} · DEMO
                </p>
                <p className="mt-1 text-[15px] leading-relaxed">{m.body}</p>
                {m.threadCount ? (
                  <p className="mt-1 text-[12px] text-ivory-dim">{m.threadCount} thread</p>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>

      <form
        className="sticky bottom-0 grid grid-cols-[1fr_auto] gap-2 border-t border-[var(--line)] bg-void p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write to the house — DEMO compose"
          aria-label="Message"
        />
        <button type="submit" className="min-h-12 px-4 text-[11px] tracking-[0.18em] uppercase text-gold">
          Send
        </button>
      </form>
      <p className="px-4 pb-3 text-[11px] text-ivory-dim">
        Private member communication, not end-to-end encryption. Stream Chat tokens are
        issued only when keys are configured. This surface uses labeled DEMO messages.
      </p>
    </div>
  );
}
