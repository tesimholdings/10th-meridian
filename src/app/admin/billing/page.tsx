import { AdminShell } from "@/components/admin/admin-shell";
import { membershipProducts } from "@/lib/config/pricing";
import { canChargeMembership } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { resolveMembershipOffer } from "@/lib/stripe/seats";
import {
  STRIPE_TEST_FOUNDING_PRICE_ID,
  STRIPE_TEST_MONTHLY_PRICE_ID,
  STRIPE_TEST_STANDARD_ENTRY_PRICE_ID,
} from "@/lib/stripe/catalog";

export const metadata = { title: "Billing admin", robots: { index: false } };

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const params = await searchParams;
  const ready = canChargeMembership();
  const offer = await resolveMembershipOffer({});
  return (
    <AdminShell title="Pricing configuration">
      <p className="text-ivory-muted">
        Founding Ten: $5,000 one-time ({offer.foundingRemaining} seats remain). After that: $10,000
        entry plus $195/month. Cancel dues and the seat ends; rejoin requires the $10,000 entry
        again. No discounts. TEST catalog on acct_1UG1Kk3QQyESIKbf.
      </p>
      <ul className="mt-8 grid gap-3">
        {Object.values(membershipProducts).map((p) => (
          <li key={p.id} className="border border-[var(--line)] p-4">
            <p className="font-serif text-2xl">{p.name}</p>
            <p className="mt-2 text-gold">{p.priceLabel}</p>
            <p className="mt-1 text-sm text-ivory-dim">
              Stripe price: {p.stripePriceId ?? "unset"}
              {"stripeMonthlyPriceId" in p && p.stripeMonthlyPriceId
                ? ` · monthly ${p.stripeMonthlyPriceId}`
                : ""}
            </p>
          </li>
        ))}
      </ul>

      <section className="mt-10 border border-[rgba(196,162,100,0.35)] p-5">
        <p className="label">Dashboard invoice (manual admits)</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ivory-muted">
          <li>Stripe Dashboard (TEST) → Customers → add or open the member.</li>
          <li>
            Founding: invoice Price {STRIPE_TEST_FOUNDING_PRICE_ID} ($5,000 one_time). Standard:
            prefer Checkout (entry + monthly). If invoicing entry only, use{" "}
            {STRIPE_TEST_STANDARD_ENTRY_PRICE_ID} then start {STRIPE_TEST_MONTHLY_PRICE_ID}.
          </li>
          <li>
            Metadata: <code>accountId</code>, <code>offer=founding|standard</code>, optional{" "}
            <code>applicationId</code>.
          </li>
          <li>Send invoice. Hosted invoice page is the pay link.</li>
          <li>
            Webhooks at <code>/api/stripe/webhook</code>: <code>checkout.session.completed</code>,{" "}
            <code>invoice.paid</code>, <code>customer.subscription.updated</code>,{" "}
            <code>customer.subscription.deleted</code>.
          </li>
        </ol>
        <p className="mt-4 text-xs text-ivory-dim">
          Do not use archived lifetime Price price_1UG1Xg3QQyESIKbfV5BfJF6U. Do not enable
          promotion codes. Do not enable livemode from this PR.
        </p>
      </section>

      <section className="mt-8 border border-[var(--line)] p-5">
        <p className="label">API helper</p>
        <p className="mt-2 text-sm text-ivory-muted">
          Creates a hosted invoice for the current entry Price (Founding $5k or Standard $10k).
          Standard monthly dues still belong on Checkout.{" "}
          {!ready ? "Stubbed until TEST keys and Price IDs are set." : null}
        </p>
        {params.invoice ? (
          <p className="mt-3 text-sm text-gold">
            {params.invoice === "invalid"
              ? "A valid email is required."
              : `Invoice helper: ${params.invoice}.`}
          </p>
        ) : null}
        <form action="/api/admin/billing/invoice" method="post" className="mt-4 grid gap-3 md:max-w-md">
          <label className="text-xs uppercase tracking-[0.16em] text-ivory-dim">
            Member email
            <input
              name="email"
              type="email"
              required
              className="mt-2 min-h-11 w-full border border-[var(--line)] bg-transparent px-3 text-ivory"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.16em] text-ivory-dim">
            Account id (optional)
            <input
              name="accountId"
              className="mt-2 min-h-11 w-full border border-[var(--line)] bg-transparent px-3 text-ivory"
            />
          </label>
          <Button type="submit" variant="gold">
            Create hosted invoice
          </Button>
        </form>
      </section>
    </AdminShell>
  );
}
