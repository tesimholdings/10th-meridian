"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DialogDrawer } from "@/components/a11y/dialog-drawer";
import {
  persistDestination,
  resolveMessageDestination,
  type ResolvedDestination,
} from "@/lib/messaging/destination";
import type { ChannelRecord, MessageRecord, ProfileRecord } from "@/lib/data/types";
import { MESSAGES_TAB_CHANNELS, MESSAGES_TAB_DMS } from "@/lib/copy/ui";
import { formatRelativeTime } from "@/lib/crossings/format";

const REACTIONS = [
  { id: "acknowledge", label: "Like" },
  { id: "raise", label: "Helpful" },
  { id: "hold", label: "Later" },
] as const;

export function ChannelApp({
  initialChannels,
  initialMessages,
  initialActiveId,
  requestedProfileId,
  profiles,
  channelMembers,
  viewerId,
  viewerName,
}: {
  initialChannels: ChannelRecord[];
  initialMessages: MessageRecord[];
  initialActiveId?: string;
  requestedProfileId?: string;
  profiles: ProfileRecord[];
  channelMembers: Record<string, string[]>;
  viewerId: string;
  viewerName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [channels, setChannels] = useState(initialChannels);
  const [messages, setMessages] = useState(initialMessages);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState<"dms" | "channels">(requestedProfileId ? "dms" : "dms");
  const [threadOf, setThreadOf] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [streamNote, setStreamNote] = useState<string | null>(null);

  const destination: ResolvedDestination = useMemo(
    () =>
      resolveMessageDestination({
        request: {
          channelId: initialActiveId,
          profileId: requestedProfileId,
        },
        viewerId,
        channels,
        channelMembers,
        profiles,
      }),
    [initialActiveId, requestedProfileId, viewerId, channels, channelMembers, profiles],
  );

  useEffect(() => {
    if (destination.status === "ok" && destination.channel) {
      persistDestination(
        `${pathname}?${new URLSearchParams({
          ...(requestedProfileId ? { to: requestedProfileId } : {}),
          channel: destination.channel.id,
        }).toString()}`,
      );
    }
  }, [destination, pathname, requestedProfileId]);

  useEffect(() => {
    void fetch("/api/stream/token", { method: "POST" })
      .then((r) => r.json())
      .then((json: { stub?: boolean }) => {
        setStreamNote(
          json.stub
            ? "Private member communication. DEMO until Stream keys are present. Not E2EE."
            : "Stream token issued. This shell still uses labeled DEMO messages until channels are mapped live.",
        );
      })
      .catch(() => setStreamNote("Private member communication. Not E2EE."));
  }, []);

  const activeId = destination.channel?.id;
  const roots = useMemo(
    () => messages.filter((m) => m.channelId === activeId && !m.parentId),
    [messages, activeId],
  );
  const thread = useMemo(
    () => messages.filter((m) => m.parentId === threadOf),
    [messages, threadOf],
  );

  async function send() {
    if (!draft.trim() || !destination.canCompose || !destination.channel) return;
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        channelId: destination.channel.id,
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

  async function openChannel(channel: ChannelRecord) {
    setDrawer(false);
    setThreadOf(null);
    await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", channelId: channel.id }),
    });
    setChannels((list) => list.map((c) => (c.id === channel.id ? { ...c, unread: 0 } : c)));
    const peerId =
      channel.kind === "dm"
        ? (channelMembers[channel.id] ?? []).find((id) => id !== viewerId)
        : undefined;
    const params = new URLSearchParams();
    if (peerId) params.set("to", peerId);
    params.set("channel", channel.id);
    router.push(`/member/messages?${params.toString()}`);
  }

  async function retry() {
    if (!requestedProfileId) return;
    setRetrying(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: requestedProfileId }),
    });
    const json = (await res.json()) as { ok?: boolean; href?: string };
    setRetrying(false);
    if (json.ok && json.href) router.replace(json.href);
  }

  const dms = channels.filter((c) => c.kind === "dm");
  const houses = channels.filter((c) => c.kind !== "dm");
  const inbox = tab === "dms" ? dms : houses;

  const inboxMode = destination.status === "inbox";

  return (
    <div className={`member-messages ${inboxMode ? "is-inbox" : "is-thread"}`}>
      <aside className="member-messages-inbox">
        <div className="flex gap-2 border-b border-[var(--line)] px-1">
          <TabButton on={tab === "dms"} onClick={() => setTab("dms")}>
            {MESSAGES_TAB_DMS}
          </TabButton>
          <TabButton on={tab === "channels"} onClick={() => setTab("channels")}>
            {MESSAGES_TAB_CHANNELS}
          </TabButton>
        </div>
        <ul className="stagger-in divide-y divide-[var(--line)] px-2">
          {inbox.map((c) => {
            const last = messages.filter((m) => m.channelId === c.id && !m.parentId).at(-1);
            const peer =
              c.kind === "dm"
                ? profiles.find((p) => (channelMembers[c.id] ?? []).includes(p.id) && p.id !== viewerId)
                : undefined;
            const active = destination.channel?.id === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => void openChannel(c)}
                  className={`pressable flex min-h-16 w-full items-center gap-3 py-3 text-left ${
                    active ? "text-[var(--navy)]" : ""
                  }`}
                >
                  <span className="avatar h-12 w-12 text-sm" style={{ background: peer?.accent ?? "#087CB8" }}>
                    {peer?.initials ?? c.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-serif text-xl">{peer?.displayName ?? c.name}</span>
                      <span className="text-xs text-[var(--ivory-dim)]">
                        {last ? formatRelativeTime(last.createdAt) : ""}
                      </span>
                    </span>
                    <span className="block truncate text-sm text-[var(--ivory-dim)]">
                      {last?.body ?? c.topic}
                    </span>
                  </span>
                  {c.unread ? (
                    <span className="min-w-5 rounded-full bg-[var(--blue)] px-1.5 text-center text-[10px] text-white">
                      {c.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="member-messages-thread relative flex min-h-[70vh] flex-col md:min-h-0">
        {inboxMode ? (
          <div className="hidden flex-1 flex-col justify-center px-10 py-16 md:flex">
            <p className="section-kicker text-sm">Messages</p>
            <p className="mt-2 font-serif text-3xl">Choose a conversation</p>
            <p className="mt-3 max-w-md text-sm text-[var(--navy-soft)]">
              Inbox stays on the left. Threads open here — private member notes, never a public board.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-3 md:px-5">
              <button type="button" className="min-h-11 text-sm text-[var(--blue)] md:hidden" onClick={() => setDrawer(true)}>
                Inbox
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-2xl leading-tight">{destination.headerName}</p>
                <p className="text-xs text-[var(--ivory-dim)]">{destination.headerDetail}</p>
              </div>
              {destination.peer ? (
                <Link href={`/member/members/${destination.peer.id}`} className="avatar h-10 w-10 text-sm" style={{ background: destination.peer.accent }}>
                  {destination.peer.initials}
                </Link>
              ) : null}
            </div>

            <DialogDrawer open={drawer} title="Inbox" onClose={() => setDrawer(false)}>
              <div className="px-2 pb-4">
                {dms.concat(houses).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => void openChannel(c)}
                    className="flex min-h-12 w-full items-center justify-between px-3 text-left text-sm"
                  >
                    <span>{c.kind === "dm" ? c.name : `#${c.slug}`}</span>
                    {c.unread ? <span className="text-[var(--gold)]">{c.unread}</span> : null}
                  </button>
                ))}
              </div>
            </DialogDrawer>

            {destination.status === "unavailable" ? (
              <div className="flex flex-1 flex-col justify-center px-5 py-10">
                <p className="font-serif text-2xl">{destination.headerName}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ivory-dim)]">{destination.message}</p>
                {requestedProfileId ? (
                  <button type="button" className="action-quiet mt-5 w-fit" disabled={retrying} onClick={() => void retry()}>
                    {retrying ? "Retrying…" : "Retry conversation"}
                  </button>
                ) : (
                  <Link href="/member/messages" className="action-quiet mt-5 inline-flex w-fit items-center">
                    Back to inbox
                  </Link>
                )}
              </div>
            ) : (
              <div className="min-h-[40vh] flex-1 space-y-4 px-3 py-5 md:px-5">
                {(threadOf ? thread : roots).length === 0 ? (
                  <p className="text-sm text-[var(--ivory-dim)]">
                    {threadOf ? "No replies yet." : `Start a private note with ${destination.headerName}.`}
                  </p>
                ) : (
                  (threadOf ? thread : roots).map((m) => {
                    const own = m.authorName === viewerName;
                    return (
                      <article key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[84%] px-4 py-3 ${own ? "bubble-own" : "bubble-theirs"}`}>
                          <p className="text-[11px] opacity-70">{m.authorName}</p>
                          <p className="mt-1 text-[15px] leading-relaxed">{m.body}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {REACTIONS.map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => void react(m.id, r.id)}
                                className="text-[11px] opacity-80"
                              >
                                {r.label}
                                {m.reactions?.[r.id]?.length ? ` ${m.reactions[r.id].length}` : ""}
                              </button>
                            ))}
                            {!threadOf ? (
                              <button type="button" className="text-[11px]" onClick={() => setThreadOf(m.id)}>
                                Thread {m.threadCount ? `(${m.threadCount})` : ""}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
                {threadOf ? (
                  <button type="button" className="text-sm text-[var(--blue)]" onClick={() => setThreadOf(null)}>
                    Back to conversation
                  </button>
                ) : null}
              </div>
            )}

            <form
              className="sticky bottom-0 grid grid-cols-[1fr_auto] gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-3 py-3 md:px-5"
              style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!destination.canCompose}
                placeholder={
                  destination.canCompose
                    ? threadOf
                      ? `Reply to ${destination.headerName}`
                      : `Message ${destination.headerName}`
                    : "Sending is disabled until this conversation loads"
                }
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={!destination.canCompose || !draft.trim()}
                className="min-h-12 rounded-full bg-[var(--blue)] px-4 text-sm text-white"
              >
                Send
              </button>
            </form>
            <p className="px-3 pb-2 text-[11px] text-[var(--ivory-dim)] md:px-5">
              {streamNote ?? "Private member communication, not end-to-end encryption. Absolutely no soliciting."}
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function TabButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tab-slide min-h-11 flex-1 border-b-2 text-sm ${
        on ? "border-[var(--gold)] text-[var(--navy)]" : "border-transparent text-[var(--ivory-dim)]"
      }`}
    >
      {children}
    </button>
  );
}
