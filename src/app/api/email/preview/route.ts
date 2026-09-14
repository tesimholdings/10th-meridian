import { emailTemplates } from "@/lib/resend/templates";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  if (!env.previewTools) {
    return new Response("Not found", { status: 404 });
  }
  const type = new URL(request.url).searchParams.get("type") ?? "doorsReminder";
  const tpl =
    type === "applicationReceived"
      ? emailTemplates.applicationReceived()
      : type === "approved"
        ? emailTemplates.approvedPaymentPending()
        : type === "declined"
          ? emailTemplates.declined()
          : type === "referral"
            ? emailTemplates.referralGranted()
            : emailTemplates.doorsReminder("the next tenth");
  return new Response(tpl.html, { headers: { "Content-Type": "text/html" } });
}
