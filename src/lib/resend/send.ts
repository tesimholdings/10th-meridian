import { sendTransactional, type SendResult } from "@/lib/resend/client";
import { emailTemplates } from "@/lib/resend/templates";

/** Application received — discretionary selection, never a promise. */
export async function sendApplyReceived(
  to: string,
  applicationId: string,
): Promise<SendResult> {
  const tpl = emailTemplates.applicationReceived();
  return sendTransactional({
    to,
    subject: tpl.subject,
    html: tpl.html,
    idempotencyKey: `apply-received/${applicationId}`.slice(0, 256),
  });
}

/** Waitlist / Open House reminder — a reminder, not an application. */
export async function sendOpenHouseReminder(
  to: string,
  when: string,
  reminderId: string,
): Promise<SendResult> {
  const tpl = emailTemplates.doorsReminder(when);
  return sendTransactional({
    to,
    subject: tpl.subject,
    html: tpl.html,
    idempotencyKey: `open-house-reminder/${reminderId}`.slice(0, 256),
  });
}

/** Steward invitation to continue to lifetime checkout. */
export async function sendInvite(
  to: string,
  inviteId: string,
): Promise<SendResult> {
  const tpl = emailTemplates.invite();
  return sendTransactional({
    to,
    subject: tpl.subject,
    html: tpl.html,
    idempotencyKey: `invite/${inviteId}`.slice(0, 256),
  });
}
