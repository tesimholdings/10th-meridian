import { cookies } from "next/headers";
import { evaluateOpenHouse, type AccessDecision } from "@/lib/access/open-house";
import {
  getReferralGrant,
  getSessionUser,
  OPEN_HOUSE_FORCE_COOKIE,
  readSigned,
  type SessionUser,
} from "@/lib/access/session";
import { env } from "@/lib/env";
import { validateReferralCode } from "@/lib/referrals/validate";

export interface AccessContext {
  user: SessionUser | null;
  referralCode: string | null;
  referralValid: boolean;
  decision: AccessDecision;
}

export async function resolveAccessContext(): Promise<AccessContext> {
  const user = await getSessionUser();
  const referralCode = await getReferralGrant();
  const referral = referralCode
    ? validateReferralCode(referralCode)
    : { ok: false as const };
  const jar = await cookies();
  const forced = env.previewTools
    ? readSigned(jar.get(OPEN_HOUSE_FORCE_COOKIE)?.value)
    : null;
  const force =
    forced === "open" || forced === "closed"
      ? forced
      : undefined;
  const decision = evaluateOpenHouse({
    role: user?.role ?? "guest",
    hasValidReferral: referral.ok,
    config: force ? { force } : undefined,
  });
  return {
    user,
    referralCode,
    referralValid: referral.ok,
    decision,
  };
}
