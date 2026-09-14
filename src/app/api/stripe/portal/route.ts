import { redirect } from "next/navigation";
import { resolveAccessContext } from "@/lib/access/context";
import { getStripe } from "@/lib/stripe/client";

export async function POST() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess) {
    return new Response("Not available.", { status: 403 });
  }
  const stripe = getStripe();
  if (!stripe) {
    return new Response("Stripe Customer Portal is stubbed until keys are present.", {
      status: 501,
    });
  }
  // Live mode looks up stripe_customer_id from memberships.
  return new Response("No Stripe customer is stored for this preview session.", {
    status: 501,
  });
}

export async function GET() {
  redirect("/member/billing");
}
