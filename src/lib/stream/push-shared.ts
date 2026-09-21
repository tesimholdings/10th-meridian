export type StoredWebPush = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function fcmTokenFromEndpoint(endpoint: string): string | null {
  try {
    const url = new URL(endpoint);
    const host = url.hostname.toLowerCase();
    if (host !== "fcm.googleapis.com" && !host.endsWith(".fcm.googleapis.com")) return null;
    const token = url.pathname.split("/").filter(Boolean).pop() ?? "";
    if (token.length < 20) return null;
    return decodeURIComponent(token);
  } catch {
    return null;
  }
}

export function parseStoredWebPush(value: unknown): StoredWebPush[] {
  if (!Array.isArray(value)) return [];
  const out: StoredWebPush[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const record = row as Partial<StoredWebPush>;
    if (!record.endpoint || !record.p256dh || !record.auth) continue;
    if (typeof record.endpoint !== "string" || typeof record.p256dh !== "string" || typeof record.auth !== "string") {
      continue;
    }
    out.push({ endpoint: record.endpoint, p256dh: record.p256dh, auth: record.auth });
  }
  return out;
}

export function mergeWebPush(
  existing: StoredWebPush[],
  next: StoredWebPush,
  cap = 8,
): StoredWebPush[] {
  const filtered = existing.filter((row) => row.endpoint !== next.endpoint);
  return [...filtered, next].slice(-cap);
}

export function dropWebPush(existing: StoredWebPush[], endpoint: string): StoredWebPush[] {
  return existing.filter((row) => row.endpoint !== endpoint);
}
