import { z } from "zod";
import { env } from "@/lib/env";
import { FORGOT_PASSWORD_MESSAGE } from "@/lib/lock/unlock";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { requestPasswordReset } from "@/lib/supabase/auth";

const schema = z.object({
  identity: z.string().max(120).optional(),
  email: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "forgot-password"), env.rateLimitReminders);
  if (!limited.ok) {
    return Response.json({ ok: true, message: FORGOT_PASSWORD_MESSAGE });
  }

  const type = request.headers.get("content-type") ?? "";
  let identity = "";
  if (type.includes("application/json")) {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    identity = (parsed.success ? parsed.data.identity || parsed.data.email : "") ?? "";
  } else {
    const form = await request.formData().catch(() => null);
    identity = String(form?.get("identity") ?? form?.get("email") ?? "");
  }

  await requestPasswordReset(identity);
  return Response.json({ ok: true, message: FORGOT_PASSWORD_MESSAGE });
}
