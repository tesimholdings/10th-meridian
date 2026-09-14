import { cookies } from "next/headers";
import { z } from "zod";
import { cookieOptions, REFERRAL_COOKIE, signedValue } from "@/lib/access/cookies";
import { validateReferralCode } from "@/lib/referrals/validate";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { env } from "@/lib/env";
import { stubInsert } from "@/lib/supabase/stub";

const schema = z.object({ code: z.string().min(2).max(80) });

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "referral"), env.rateLimitReferral);
  if (!limited.ok) {
    return Response.json({ ok: false, message: "Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "That code cannot be used." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, message: "That code cannot be used." }, { status: 400 });
  }

  const result = validateReferralCode(parsed.data.code);
  stubInsert("referrals_audit", {
    code_present: true,
    ok: result.ok,
  });

  if (!result.ok) {
    return Response.json({ ok: false, message: "That code cannot be used." });
  }

  const jar = await cookies();
  jar.set(REFERRAL_COOKIE, signedValue(parsed.data.code.trim()), {
    ...cookieOptions,
    maxAge: 60 * 60 * 18,
  });

  return Response.json({
    ok: true,
    message: "A referral opens the door earlier. What happens next is still earned.",
  });
}
