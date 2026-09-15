import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { membershipFor } from "@/lib/preview/store";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess) {
    return new Response("Not available.", { status: 403 });
  }
  const stripe = getStripe();
  if (!stripe) {
    return new Response(
      "Stripe Customer Portal is stubbed until keys are present. Nothing was charged.",
      { status: 501 },
    );
  }

  const customerId = await resolveStripeCustomerId(access.user?.id, access.user?.email);
  if (!customerId) {
    return new Response(
      "No Stripe customer is stored yet. Complete Checkout or a hosted invoice first.",
      { status: 501 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.siteUrl.replace(/\/$/, "")}/member/billing`,
  });
  if (!session.url) {
    return new Response("Customer portal could not be opened.", { status: 502 });
  }
  redirect(session.url);
}

export async function GET() {
  redirect("/member/billing");
}

async function resolveStripeCustomerId(accountId?: string, email?: string) {
  const preview = membershipFor(accountId, email);
  if (preview?.stripeCustomerId) return preview.stripeCustomerId;
  if (!accountId) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("memberships")
    .select("stripe_customer_id")
    .eq("account_id", accountId)
    .in("product", ["founding", "standard"])
    .maybeSingle();
  return (data?.stripe_customer_id as string | null) ?? null;
}
