import { cookies } from "next/headers";
import { z } from "zod";
import { cookieOptions, VISITOR_TZ_COOKIE } from "@/lib/access/cookies";
import { isValidIanaTimeZone, resolveVisitorTimeZone } from "@/lib/access/timezone";

const schema = z.object({
  timeZone: z.string().min(3).max(80),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidIanaTimeZone(parsed.data.timeZone)) {
    return Response.json({ ok: false, timeZone: resolveVisitorTimeZone(null) }, { status: 400 });
  }
  const jar = await cookies();
  jar.set(VISITOR_TZ_COOKIE, parsed.data.timeZone, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  return Response.json({ ok: true, timeZone: parsed.data.timeZone });
}
