/**
 * Public application origin for member-facing links (referrals, QR, checkout).
 * Preview/live must never advertise localhost.
 * Referral links that would otherwise leave on *.vercel.app use the canonical house domain.
 */

export const CANONICAL_MEMBER_ORIGIN = "https://tenmeridian.com";

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

export function isVercelAppHost(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "vercel.app" || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

/** Member referral links stay on tenmeridian.com when the resolved host is a Vercel preview. */
export function canonicalMemberOrigin(input: {
  appUrl?: string | null;
  siteUrl?: string | null;
  vercelUrl?: string | null;
} = {}): string {
  const origin = resolvePublicOrigin(input);
  if (isVercelAppHost(origin)) return CANONICAL_MEMBER_ORIGIN;
  return origin;
}
