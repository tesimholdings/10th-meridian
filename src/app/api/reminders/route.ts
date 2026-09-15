import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { env } from "@/lib/env";
import { stubInsert } from "@/lib/supabase/stub";
import { sendOpenHouseReminder } from "@/lib/resend/send";

const schema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "remind"), env.rateLimitReminders);
  if (!limited.ok) {
    return Response.json({ ok: false, message: "Please wait a moment." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, message: "A valid email is required." }, { status: 400 });
  }
  stubInsert("reminders", parsed.data);
  await sendOpenHouseReminder(
    parsed.data.email,
    "the next tenth, America/Chicago",
    parsed.data.email,
  );
  return Response.json({
    ok: true,
    message: "We will write when the tenth returns. This is not an application.",
  });
}
