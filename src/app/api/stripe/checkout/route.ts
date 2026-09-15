import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { env } from "@/lib/env";
import { getPreviewStore } from "@/lib/preview/store";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";
import { checkoutStubMessage, createMembershipCheckoutSession } from "@/lib/stripe/checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && access.user?.role !== "approved_unpaid") {
    return new Response("Not available during Open House.", { status: 403 });
  }

  const limited = rateLimit(clientKey(request, "stripe-checkout"), 8);
  if (!limited.ok) {
    return new Response("Too many checkout attempts. Wait a moment.", { status: 429 });
  }

  const email = access.user?.email;
  const application = email
    ? getPreviewStore().applications.find((row) => row.email.toLowerCase() === email.toLowerCase())
    : undefined;

  const origin = env.siteUrl.replace(/\/$/, "");
  const result = await createMembershipCheckoutSession({
    accountId: access.user?.id ?? "",
    email,
    applicationId: application?.id,
    successUrl: `${origin}/member/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/member/billing?checkout=cancel`,
  });

  if (!result.ok) {
    return new Response(checkoutStubMessage(result.reason), { status: 501 });
  }
  redirect(result.url);
}
