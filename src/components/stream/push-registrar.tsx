"use client";

import { useEffect, useState } from "react";
import type { StreamChat } from "stream-chat";
import { fcmTokenFromEndpoint } from "@/lib/stream/push-shared";

type PushConfig = {
  stream: boolean;
  webPush: boolean;
  publicKey: string | null;
  firebasePush: boolean;
  pushProviderName: string;
  selfIds: string[];
  userId: string;
  name: string;
};

type Notice = {
  title: string;
  body: string;
  url?: string;
  action?: "enable" | "dismiss";
};

let connectTask: Promise<StreamChat | null> | null = null;
let listening = false;
let notifyMessage: (notice: Notice) => void = () => undefined;
const seenMessages = new Set<string>();

function isIos() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(nav.standalone);
}

function pushSupported() {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function connectStream(apiKey: string, user: { id: string; name: string }, token: string) {
  if (!connectTask) {
    connectTask = (async () => {
      const { StreamChat } = await import("stream-chat");
      const client = StreamChat.getInstance(apiKey);
      if (client.userID && client.userID !== user.id) {
        await client.disconnectUser();
      }
      if (!client.userID) {
        await client.connectUser({ id: user.id, name: user.name }, token);
      }
      return client;
    })().catch(() => {
      connectTask = null;
      return null;
    });
  }
  return connectTask;
}

async function disconnectStream() {
  const pending = connectTask;
  connectTask = null;
  listening = false;
  const client = await pending;
  if (client?.userID) {
    await client.disconnectUser().catch(() => undefined);
  }
}

function showIncoming(notice: Notice, messageId?: string) {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  if (messageId) {
    if (seenMessages.has(messageId)) return;
    seenMessages.add(messageId);
  }
  notifyMessage(notice);
}

function listenForMessages(client: StreamChat, selfIds: string[]) {
  if (listening) return;
  listening = true;
  client.on("notification.message_new", (event) => {
    const sender = event.message?.user?.id ?? event.user?.id ?? "";
    if (sender && selfIds.includes(sender)) return;
    const text = event.message?.text?.trim();
    if (!text) return;
    const name = event.message?.user?.name || "Member";
    showIncoming(
      {
        title: event.channel?.name || "New message",
        body: `${name}: ${text}`,
        url: "/member/messages",
        action: "dismiss",
      },
      event.message?.id,
    );
  });
}

async function subscribeToPush(publicKey: string) {
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

async function registerDevice(config: PushConfig, client: StreamChat | null) {
  if (!config.publicKey) return false;
  const subscription = await subscribeToPush(config.publicKey);
  if (!subscription) return false;
  const fcmToken = config.firebasePush ? fcmTokenFromEndpoint(subscription.endpoint) : null;
  const res = await fetch("/api/stream/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "register",
      subscription,
      deviceToken: fcmToken ?? undefined,
      pushProvider: fcmToken ? "firebase" : undefined,
    }),
  });
  if (fcmToken && client) {
    await client
      .addDevice(fcmToken, "firebase", config.userId, config.pushProviderName || undefined)
      .catch(() => undefined);
  }
  return res.ok;
}

function hintFor(config: PushConfig): Notice | null {
  if (!pushSupported()) {
    return {
      title: "Alerts stay in the house",
      body: "This browser cannot deliver phone alerts. New messages still appear while the house is open.",
      action: "dismiss",
    };
  }
  if (isIos() && !isStandalone()) {
    return {
      title: "Add to Home Screen",
      body: "On iPhone, add 10th Meridian to your Home Screen, open it from that icon, then enable alerts.",
      action: "dismiss",
    };
  }
  if (!config.webPush || !config.publicKey) {
    return {
      title: "Alerts are not armed",
      body: "Web Push keys are not set yet. New messages still appear while the house is open.",
      action: "dismiss",
    };
  }
  if (Notification.permission === "denied") {
    return {
      title: "Alerts are blocked",
      body: "Allow notifications for 10th Meridian in this browser’s settings.",
      action: "dismiss",
    };
  }
  if (Notification.permission === "default") {
    return {
      title: "Message alerts",
      body: "Get a note on this phone when a member writes.",
      action: "enable",
    };
  }
  return null;
}

export function StreamPushRegistrar() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [config, setConfig] = useState<PushConfig | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    notifyMessage = (next) => setNotice(next);
  });

  useEffect(() => {
    const onServiceWorker = (event: MessageEvent) => {
      const data = event.data as { type?: string; payload?: { title?: string; body?: string; url?: string; messageId?: string } };
      if (data?.type !== "tm-message" || !data.payload) return;
      showIncoming(
        {
          title: data.payload.title || "New message",
          body: data.payload.body || "New message",
          url: data.payload.url || "/member/messages",
          action: "dismiss",
        },
        data.payload.messageId,
      );
    };
    const onSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.action.includes("/api/auth/sign-out")) return;
      void disconnectStream();
    };
    navigator.serviceWorker?.addEventListener("message", onServiceWorker);
    document.addEventListener("submit", onSubmit, true);

    let cancelled = false;
    void (async () => {
      const configRes = await fetch("/api/stream/push");
      if (!configRes.ok || cancelled) return;
      const next = (await configRes.json()) as PushConfig;
      if (!next.stream || cancelled) return;
      setConfig(next);
      const tokenRes = await fetch("/api/stream/token", { method: "POST" });
      const token = (await tokenRes.json()) as { stub?: boolean; token?: string | null; apiKey?: string | null };
      if (token.stub || !token.token || !token.apiKey || cancelled) return;
      const client = await connectStream(token.apiKey, { id: next.userId, name: next.name }, token.token);
      if (!client || cancelled) return;
      listenForMessages(client, next.selfIds ?? [next.userId]);
      await fetch("/api/stream/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });
      if (cancelled) return;
      if (next.webPush && next.publicKey && pushSupported() && Notification.permission === "granted") {
        const ok = await registerDevice(next, client).catch(() => false);
        if (!ok && !cancelled) setNotice(hintFor(next));
        return;
      }
      if (!cancelled) setNotice(hintFor(next));
    })();

    return () => {
      cancelled = true;
      navigator.serviceWorker?.removeEventListener("message", onServiceWorker);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  async function enable() {
    if (!config?.publicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotice(hintFor({ ...config }));
        return;
      }
      const tokenRes = await fetch("/api/stream/token", { method: "POST" });
      const token = (await tokenRes.json()) as { stub?: boolean; token?: string | null; apiKey?: string | null };
      const client =
        token.token && token.apiKey
          ? await connectStream(token.apiKey, { id: config.userId, name: config.name }, token.token)
          : null;
      const ok = await registerDevice(config, client);
      setNotice(
        ok
          ? null
          : {
              title: "Alerts could not be enabled",
              body: "Try again from the Home Screen icon.",
              action: "dismiss",
            },
      );
    } finally {
      setBusy(false);
    }
  }

  if (!notice) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] px-4 md:bottom-6">
      <div
        role="status"
        className="header-glass pointer-events-auto mx-auto flex max-w-md flex-col gap-2 rounded-2xl px-4 py-3 text-[var(--navy)]"
      >
        <p className="font-serif text-xl leading-tight">{notice.title}</p>
        <p className="text-sm leading-relaxed text-[var(--ivory-dim)]">{notice.body}</p>
        <div className="flex gap-2">
          {notice.action === "enable" ? (
            <button type="button" className="action-quiet" disabled={busy} onClick={() => void enable()}>
              {busy ? "Enabling…" : "Enable alerts"}
            </button>
          ) : null}
          {notice.url ? (
            <a href={notice.url} className="action-quiet">
              Open
            </a>
          ) : null}
          <button type="button" className="min-h-11 px-3 text-sm text-[var(--ivory-dim)]" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
