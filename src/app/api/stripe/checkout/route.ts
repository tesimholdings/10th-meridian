import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { membershipProducts, type MembershipProductId } from "@/lib/config/pricing";
import { env } from "@/lib/env";
import {
  checkoutStubMessage,
  createLifetimeCheckoutSession,
} from "@/lib/stripe/lifetime";

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess && access.user?.role !== "approved_unpaid") {
    return new Response("Not available during Open House.", { status: 403 });
  }

  const form = await request.formData();
  const product = String(form.get("product") ?? "") as MembershipProductId;
  const item = membershipProducts[product];
  if (!item?.checkoutEligible) {
    return new Response("This product is by application.", { status: 400 });
  }

  const result = await createLifetimeCheckoutSession({
    accountId: access.user?.id ?? "",
    email: access.user?.email,
    successUrl: `${env.siteUrl}/member/billing?checkout=success`,
    cancelUrl: `${env.siteUrl}/member/billing?checkout=cancel`,
  });

  if (!result.ok) {
    return new Response(checkoutStubMessage(result.reason), { status: 501 });
  }
  redirect(result.url);
}
