import { Resend } from "resend";
import { env, hasResend } from "@/lib/env";

let client: Resend | null = null;

export function getResend(): Resend | null {
  if (!hasResend()) return null;
  if (!client) client = new Resend(env.resendApiKey);
  return client;
}

export type SendResult = {
  ok: boolean;
  stub: boolean;
  id?: string;
  error?: string;
};

/**
 * Server-only transactional send. Missing RESEND_API_KEY is a safe stub —
 * never throws, never invents a delivery.
 */
export async function sendTransactional(input: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: true, stub: true };
  }
  const result = await resend.emails.send(
    {
      from: env.resendFromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
  if (result.error) {
    return { ok: false, stub: false, error: result.error.message };
  }
  return { ok: true, stub: false, id: result.data?.id };
}
