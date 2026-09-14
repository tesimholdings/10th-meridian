import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { getStripe } from "@/lib/stripe/client";
import { stubHtmlPage } from "@/lib/http/stub-page";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess) {
    return new Response("Not available.", { status: 403 });
  }
  const stripe = getStripe();
  if (!stripe) {
    return stubHtmlPage({
      title: "Customer portal is stubbed.",
      body: "Stripe Customer Portal waits on live keys. No amount is invented.",
      status: 501,
    });
  }
  // Live mode looks up stripe_customer_id from memberships.
  return stubHtmlPage({
    title: "No Stripe customer in this preview.",
    body: "This DEMO session has no stored stripe_customer_id.",
    status: 501,
  });
}

export async function GET() {
  redirect("/member/billing");
}
