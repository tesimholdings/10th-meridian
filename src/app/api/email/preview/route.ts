import { emailTemplates } from "@/lib/resend/templates";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  if (!env.previewTools) {
    return new Response("Not found", { status: 404 });
  }
  const type = new URL(request.url).searchParams.get("type") ?? "doorsReminder";
  const templates = {
    applicationReceived: () => emailTemplates.applicationReceived(),
    invite: () => emailTemplates.invite(),
    approved: () => emailTemplates.approvedPaymentPending(),
    declined: () => emailTemplates.declined(),
    referral: () => emailTemplates.referralGranted(),
    crossingAccepted: () => emailTemplates.crossingAccepted(),
    crossingOverlap: () => emailTemplates.crossingOverlap("Paris", "Three"),
    doorsReminder: () => emailTemplates.doorsReminder("the next tenth"),
  } as const;
  const tpl =
    (templates[type as keyof typeof templates] ?? templates.doorsReminder)();
  return new Response(tpl.html, { headers: { "Content-Type": "text/html" } });
}
