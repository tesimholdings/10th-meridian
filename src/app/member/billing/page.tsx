import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { membershipProducts } from "@/lib/config/pricing";
import { Button } from "@/components/ui/button";
import { canChargeMembership, hasStripe } from "@/lib/env";
import { membershipFor } from "@/lib/preview/store";
import {
  FOUNDING_ENTRY_LABEL,
  MONTHLY_DUES_LABEL,
  STANDARD_ENTRY_LABEL,
} from "@/lib/copy/community";
import { MEMBERSHIP_NO_DISCOUNT, MEMBERSHIP_STANDARD } from "@/lib/copy/open-house";
import { resolveMembershipOffer } from "@/lib/stripe/seats";
import {
  STRIPE_TEST_FOUNDING_PRICE_ID,
  STRIPE_TEST_MONTHLY_PRICE_ID,
  STRIPE_TEST_STANDARD_ENTRY_PRICE_ID,
} from "@/lib/stripe/catalog";

export const metadata = { title: "Billing", robots: { index: false } };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const access = await resolveAccessContext();
  const params = await searchParams;
  const pending = access.user?.role === "approved_unpaid";
  const demoGuest = !access.decision.isMemberAccess;
  const paid = membershipFor(access.user?.id, access.user?.email);
  const active = paid?.status === "active";
  const offer = await resolveMembershipOffer({
    accountId: access.user?.id,
    email: access.user?.email,
  });
  const chargeReady = canChargeMembership();

  if (demoGuest && !pending) {
    return (
      <MemberShell user={access.user} demo title="Billing">
        <p className="text-ivory-muted">
          Billing, invoices, and the customer portal are not part of Open House.
        </p>
      </MemberShell>
    );
  }

  const headline =
    offer.offer === "founding"
      ? `${FOUNDING_ENTRY_LABEL}. Founding Ten.`
      : `${STANDARD_ENTRY_LABEL} + ${MONTHLY_DUES_LABEL}/mo`;

  return (
    <MemberShell user={access.user} demo={pending && !active} title="Billing" hasHeading>
      <h1 className="font-serif text-3xl text-[var(--navy)]">Billing</h1>
      <CheckoutNotice state={params.checkout} paid={active} sessionId={params.session_id} />

      <article className="billing-ledger mt-8 overflow-hidden rounded-3xl border border-[rgba(196,162,100,0.45)] p-6 text-[#efe6d4] md:p-8">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[#c4a264]">
          {offer.offer === "founding" ? "Founding Ten" : "Membership"}
        </p>
        <h2 className="mt-3 font-serif text-4xl text-[#faf8f2]">{headline}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c9bfa8]">
          {offer.offer === "founding"
            ? `One payment of ${FOUNDING_ENTRY_LABEL}. The same for everyone. ${offer.foundingRemaining} of 10 founding seats remain.`
            : MEMBERSHIP_STANDARD}
        </p>
        <p className="mt-4 text-sm text-[#c4a264]">{MEMBERSHIP_NO_DISCOUNT}</p>
        <p className="mt-1 text-sm text-[#8f8774]">
          Founding seats remaining: {offer.foundingRemaining} / 10
        </p>

        {active ? (
          <p className="mt-6 text-sm text-[#d4af6a]">
            {paid?.product === "founding"
              ? "Founding membership is active."
              : "Membership is active. Monthly dues stay current through Stripe. Cancel dues and the seat ends."}
          </p>
        ) : paid?.status === "canceled" ? (
          <p className="mt-6 text-sm text-[#d4af6a]">
            Dues ended. Rejoin requires the {STANDARD_ENTRY_LABEL} entry again, then {MONTHLY_DUES_LABEL}/month.
          </p>
        ) : (
          <form action="/api/stripe/checkout" method="post" className="mt-8">
            <Button type="submit" variant="gold">
              Continue to Stripe Checkout
            </Button>
          </form>
        )}

        {!chargeReady && !active ? (
          <p className="mt-4 text-xs leading-relaxed text-[#8f8774]">
            Preview demo: Checkout is stubbed until TEST keys and Price IDs are set (
            {STRIPE_TEST_FOUNDING_PRICE_ID}, {STRIPE_TEST_STANDARD_ENTRY_PRICE_ID},{" "}
            {STRIPE_TEST_MONTHLY_PRICE_ID}). The route returns 501 and charges nothing.
            {!hasStripe() ? " STRIPE_SECRET_KEY is missing." : null}
          </p>
        ) : null}
      </article>

      <div className="mt-8 grid gap-4">
        {Object.values(membershipProducts)
          .filter((p) => p.id === "organization")
          .map((p) => (
            <article key={p.id} className="border border-[var(--line)] p-5">
              <h2 className="font-serif text-2xl">{p.name}</h2>
              <p className="mt-2 text-sm text-[var(--navy-soft)]">{p.summary}</p>
              <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-[var(--gold-dim)]">
                {p.priceLabel}
              </p>
              <p className="mt-4 text-sm text-[var(--ivory-dim)]">By application.</p>
            </article>
          ))}
      </div>

      {active || (!pending && paid) ? (
        <form action="/api/stripe/portal" method="post" className="mt-6">
          <Button type="submit" variant="quiet">
            Invoices & receipts
          </Button>
        </form>
      ) : null}
    </MemberShell>
  );
}

function CheckoutNotice({
  state,
  paid,
  sessionId,
}: {
  state?: string;
  paid: boolean;
  sessionId?: string;
}) {
  if (paid && state === "success") {
    return (
      <p className="mt-4 border border-[rgba(196,162,100,0.45)] bg-[rgba(7,8,9,0.06)] px-4 py-3 text-sm text-[var(--navy)]">
        Payment confirmed. Membership is unlocked.
      </p>
    );
  }
  if (state === "success") {
    return (
      <p className="mt-4 border border-[rgba(196,162,100,0.45)] bg-[rgba(7,8,9,0.06)] px-4 py-3 text-sm text-[var(--navy)]">
        Stripe is confirming payment
        {sessionId ? ` (session ${sessionId.slice(0, 18)}…)` : ""}. Membership unlocks when the
        webhook marks it paid — visiting this URL alone does not charge or admit.
      </p>
    );
  }
  if (state === "cancel") {
    return (
      <p className="mt-4 border border-[var(--line)] px-4 py-3 text-sm text-[var(--navy-soft)]">
        Checkout was not completed. No charge was made.
      </p>
    );
  }
  if (paid) return null;
  return (
    <p className="mt-3 text-sm text-[var(--navy-soft)]">
      A steward approved the application. Membership begins after the Founding {FOUNDING_ENTRY_LABEL}{" "}
      payment, or after Standard {STANDARD_ENTRY_LABEL} + {MONTHLY_DUES_LABEL}/month.
    </p>
  );
}
