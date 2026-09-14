import { Resend } from "resend";
import { env, hasResend } from "@/lib/env";

let client: Resend | null = null;

export function getResend(): Resend | null {
  if (!hasResend()) return null;
  if (!client) client = new Resend(env.resendApiKey);
  return client;
}

export async function sendTransactional(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; stub: boolean; id?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: true, stub: true };
  }
  const result = await resend.emails.send({
    from: env.resendFromEmail,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  if (result.error) return { ok: false, stub: false };
  return { ok: true, stub: false, id: result.data?.id };
}
