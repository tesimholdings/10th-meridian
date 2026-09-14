import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { getStripe } from "@/lib/stripe/client";
import { membershipProducts, type MembershipProductId } from "@/lib/config/pricing";
import { env } from "@/lib/env";

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

  const stripe = getStripe();
  if (!stripe || !item.stripePriceId) {
    return new Response(
      "Stripe Checkout is stubbed. Add STRIPE_SECRET_KEY and an approved price ID. No amount is invented.",
      { status: 501 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: item.stripePriceId, quantity: 1 }],
    success_url: `${env.siteUrl}/member/billing?checkout=success`,
    cancel_url: `${env.siteUrl}/member/billing?checkout=cancel`,
    customer_email: access.user?.email,
    metadata: {
      accountId: access.user?.id ?? "",
      product,
    },
  });

  if (!session.url) {
    return new Response("Unable to start checkout.", { status: 500 });
  }
  redirect(session.url);
}
