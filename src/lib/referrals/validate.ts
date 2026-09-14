import { demoReferrals } from "@/lib/data/demo";
import type { ReferralRecord } from "@/lib/data/types";
import { getPreviewStore } from "@/lib/preview/store";

export type ReferralPublicResult =
  | { ok: true; earlyAccess: true }
  | { ok: false };

/**
 * Server validation. Never leak whether a code was used, only whether it
 * currently grants early access. Expired, revoked, or exhausted codes fail
 * the same way as unknown codes.
 */
export function validateReferralCode(
  codeOrToken: string,
  now = new Date(),
  catalog: ReferralRecord[] = getPreviewStore().referrals,
): ReferralPublicResult {
  const needle = codeOrToken.trim().toUpperCase();
  if (!needle) return { ok: false };

  const match = catalog.find(
    (r) =>
      r.code.toUpperCase() === needle || r.token.toUpperCase() === needle,
  );

  if (!match) return { ok: false };
  if (match.revokedAt) return { ok: false };
  if (match.expiresAt && new Date(match.expiresAt).getTime() <= now.getTime()) {
    return { ok: false };
  }
  if (match.useCount >= match.maxUses) return { ok: false };

  return { ok: true, earlyAccess: true };
}

export function referralByCode(code: string): ReferralRecord | null {
  const catalog = getPreviewStore().referrals;
  return (
    catalog.find((r) => r.code.toUpperCase() === code.trim().toUpperCase()) ??
    demoReferrals.find((r) => r.code.toUpperCase() === code.trim().toUpperCase()) ??
    null
  );
}
