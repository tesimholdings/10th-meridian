/**
 * Public application origin for member-facing links (referrals, QR, checkout).
 * Preview/live must never advertise localhost. Do not hardcode an inactive domain.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function isPublicHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!url.hostname || LOCAL_HOSTS.has(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function normalize(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function httpsOrigin(hostOrUrl: string): string {
  const trimmed = normalize(hostOrUrl);
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export function resolvePublicOrigin(input: {
  appUrl?: string | null;
  siteUrl?: string | null;
  vercelUrl?: string | null;
} = {}): string {
  for (const candidate of [input.appUrl, input.siteUrl]) {
    if (!candidate?.trim()) continue;
    const origin = normalize(candidate);
    if (isPublicHttpOrigin(origin)) return origin;
  }
  if (input.vercelUrl?.trim()) {
    const vercel = httpsOrigin(input.vercelUrl);
    if (isPublicHttpOrigin(vercel)) return vercel;
  }
  if (input.siteUrl?.trim()) return normalize(input.siteUrl);
  return "http://localhost:3000";
}
