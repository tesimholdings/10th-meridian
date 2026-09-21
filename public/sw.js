/* 10th Meridian message alerts. Served from / so the installed home-screen app can subscribe. */

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const visible = clients.some((client) => client.visibilityState === "visible");
      if (visible) {
        for (const client of clients) {
          client.postMessage({ type: "tm-message", payload });
        }
        return undefined;
      }
      return self.registration.showNotification(payload.title || "10th Meridian", {
        body: payload.body || "New message",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: payload.tag || "tm-message",
        data: { url: payload.url || "/member/messages" },
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/member/messages", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if (!client.url.startsWith(self.location.origin)) continue;
        if ("navigate" in client && typeof client.navigate === "function") {
          await client.navigate(target);
        }
        return client.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});

function readPayload(event) {
  if (!event.data) return { title: "10th Meridian", body: "New message", url: "/member/messages" };
  try {
    const json = event.data.json();
    if (json && typeof json === "object") {
      const notification = json.notification || {};
      return {
        title: json.title || notification.title || "10th Meridian",
        body: json.body || notification.body || "New message",
        url: json.url || json.data?.url || "/member/messages",
        tag: json.tag || json.messageId || "tm-message",
        messageId: json.messageId || "",
      };
    }
  } catch {
    // Fall through to plain text.
  }
  return { title: "10th Meridian", body: event.data.text() || "New message", url: "/member/messages" };
}
