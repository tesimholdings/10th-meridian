import { cookies } from "next/headers";
import type { AppRole } from "@/lib/data/types";
import {
  ACCOUNT_COOKIE,
  cookieOptions,
  OPEN_HOUSE_FORCE_COOKIE,
  REFERRAL_COOKIE,
  ROLE_COOKIE,
  signedValue,
} from "@/lib/access/cookies";
import { env } from "@/lib/env";
import type { UnlockResolution } from "@/lib/lock/unlock";

export function pathForRole(role: AppRole): string {
  if (role === "administrator" || role === "moderator") return "/admin";
  if (role === "approved_unpaid") return "/member/billing";
  return "/member/home";
}

export async function applyMemberSession(input: {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isDemo: boolean;
}) {
  const jar = await cookies();
  jar.set(ROLE_COOKIE, signedValue(input.role), {
    ...cookieOptions,
    maxAge: 60 * 60 * 12,
  });
  jar.set(
    ACCOUNT_COOKIE,
    signedValue(
      JSON.stringify({
        id: input.id,
        email: input.email,
        name: input.name,
        isDemo: input.isDemo,
      }),
    ),
    { ...cookieOptions, maxAge: 60 * 60 * 12 },
  );
}

export async function applyReferralGrant(code: string) {
  const jar = await cookies();
  jar.set(REFERRAL_COOKIE, signedValue(code), {
    ...cookieOptions,
    maxAge: 60 * 60 * 18,
  });
  if (env.previewTools) {
    jar.set(OPEN_HOUSE_FORCE_COOKIE, signedValue("open"), {
      ...cookieOptions,
      maxAge: 60 * 60 * 12,
    });
  }
}

export async function applyUnlockHit(
  hit: Exclude<UnlockResolution, { kind: "miss" }>,
): Promise<string> {
  if (hit.kind === "member") {
    await applyMemberSession({
      id: hit.profile.id,
      email: hit.email,
      name: hit.profile.displayName,
      role: "member",
      isDemo: true,
    });
    return "/member/home";
  }
  if (hit.kind === "steward") {
    await applyMemberSession({
      id: `preview-${hit.role}`,
      email: hit.email,
      name: hit.name,
      role: hit.role,
      isDemo: true,
    });
    return pathForRole(hit.role);
  }
  await applyReferralGrant(hit.code);
  return "/open-house";
}
