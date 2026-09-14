import { cookies } from "next/headers";
import {
  evaluateOpenHouse,
  resolveVisitorTimeZone,
  type AccessDecision,
} from "@/lib/access/open-house";
import {
  getReferralGrant,
  getSessionUser,
  OPEN_HOUSE_FORCE_COOKIE,
  readSigned,
  type SessionUser,
} from "@/lib/access/session";
import { VISITOR_TZ_COOKIE } from "@/lib/access/cookies";
import { env } from "@/lib/env";
import { getPreviewStore } from "@/lib/preview/store";
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
  const store = getPreviewStore();
  const referral = referralCode
    ? validateReferralCode(referralCode, new Date(), store.referrals)
    : { ok: false as const };
  const jar = await cookies();
  const forced = env.previewTools
    ? readSigned(jar.get(OPEN_HOUSE_FORCE_COOKIE)?.value)
    : null;
  const force =
    forced === "open" || forced === "closed"
      ? forced
      : store.openHouse.force !== "auto"
        ? store.openHouse.force
        : undefined;
  const visitorTz = resolveVisitorTimeZone(
    jar.get(VISITOR_TZ_COOKIE)?.value,
    store.openHouse.timeZone || env.openHouseTimezone,
  );
  const decision = evaluateOpenHouse({
    role: user?.role ?? "guest",
    hasValidReferral: referral.ok,
    config: {
      ...store.openHouse,
      timeZone: visitorTz,
      force: force ?? store.openHouse.force,
    },
  });
  return {
    user,
    referralCode,
    referralValid: referral.ok,
    decision,
  };
}
