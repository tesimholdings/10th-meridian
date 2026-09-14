import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cookieOptions, REFERRAL_COOKIE, signedValue } from "@/lib/access/cookies";
import { validateReferralCode } from "@/lib/referrals/validate";

export default async function ReferralTokenPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const result = validateReferralCode(decodeURIComponent(code));
  if (result.ok) {
    const jar = await cookies();
    jar.set(REFERRAL_COOKIE, signedValue(code), {
      ...cookieOptions,
      maxAge: 60 * 60 * 18,
    });
  }
  redirect(result.ok ? "/open-house" : "/referral");
}
