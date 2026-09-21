import { cookies } from "next/headers";
import { cookieOptions, readSigned, signedValue } from "@/lib/access/cookies";
import {
  encodeOnboardingCookie,
  parseOnboardingCookie,
  type OnboardingCookie,
  type OnboardingStatus,
} from "@/lib/profile/onboarding";

export const ONBOARDING_COOKIE = "tm_onboarding";

export async function readOnboardingCookie(): Promise<OnboardingCookie | null> {
  const jar = await cookies();
  return parseOnboardingCookie(readSigned(jar.get(ONBOARDING_COOKIE)?.value));
}

export async function writeOnboardingCookie(
  accountId: string,
  status: OnboardingStatus,
): Promise<void> {
  const jar = await cookies();
  jar.set(ONBOARDING_COOKIE, signedValue(encodeOnboardingCookie({ accountId, status })), {
    ...cookieOptions,
    maxAge: 60 * 60 * 12,
  });
}

export async function clearOnboardingCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ONBOARDING_COOKIE);
}
