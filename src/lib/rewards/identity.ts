import { env } from "@/lib/env";
import { resolvePublicOrigin } from "@/lib/config/public-origin";

/** Demo-stable personal referral identity. Same member always gets the same code. */
export function memberReferralCode(input: {
  id: string;
  displayName?: string;
  initials?: string;
}): string {
  const last = (input.displayName ?? "").trim().split(/\s+/).filter(Boolean).at(-1) ?? "";
  const fromName = last.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 8);
  const fromInitials = (input.initials ?? "").replace(/[^A-Za-z]/g, "").toUpperCase();
  const stem = fromName || fromInitials || input.id.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `${stem}-10`;
}

export function memberReferralToken(memberId: string): string {
  return `member-${memberId}`.toLowerCase();
}

export function memberReferralLink(code: string, siteUrl?: string): string {
  const origin = resolvePublicOrigin({
    appUrl: siteUrl,
    siteUrl: siteUrl ?? env.siteUrl,
    vercelUrl: process.env.VERCEL_URL,
  });
  return `${origin.replace(/\/$/, "")}/referral/${encodeURIComponent(code)}`;
}
