import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { membershipProducts } from "@/lib/config/pricing";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Billing", robots: { index: false } };

export default async function BillingPage() {
  const access = await resolveAccessContext();
  const pending = access.user?.role === "approved_unpaid";
  const demoGuest = !access.decision.isMemberAccess;

  if (demoGuest && !pending) {
    return (
      <MemberShell user={access.user} demo title="Billing">
        <p className="text-ivory-muted">
          Billing, invoices, and the customer portal are not part of Open House.
        </p>
      </MemberShell>
    );
  }

  return (
    <MemberShell user={access.user} demo={pending} title="Billing">
      {pending ? (
        <div className="panel p-5" style={{ borderColor: "var(--gold-dim)" }}>
          <p className="label">The next step</p>
          <h1 className="mt-3 font-serif text-3xl">You have been invited to continue.</h1>
          <p className="mt-3 text-sm text-ivory-muted">
            A steward approved the application. Membership begins after Stripe-hosted
            checkout for Lifetime — $10,000, one time. Checkout stays stubbed until
            Stripe keys and a one-time Lifetime Price ID exist.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ivory-muted">
          Checkout and the customer portal are Stripe-hosted. This house stores
          Stripe references only — never card data. Lifetime is $10,000, one time.
          Monthly billing will come later.
        </p>
      )}
      <div className="mt-8 grid gap-4">
        {Object.values(membershipProducts).map((p) => (
          <article key={p.id} className="panel p-5">
            <h2 className="font-serif text-2xl">{p.name}</h2>
            <p className="mt-2 text-sm text-ivory-muted">{p.summary}</p>
            <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-gold">
              {p.priceLabel}
              {p.cadence === "one-time" ? " · one time" : ""}
            </p>
            {p.checkoutEligible ? (
              <form action="/api/stripe/checkout" method="post" className="mt-4">
                <input type="hidden" name="product" value={p.id} />
                <Button type="submit" variant={pending && p.id === "lifetime" ? "gold" : "ghost"}>
                  Continue to Stripe Checkout
                </Button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-ivory-dim">By application.</p>
            )}
          </article>
        ))}
      </div>
      {!pending ? (
        <form action="/api/stripe/portal" method="post" className="mt-6">
          <Button type="submit" variant="ghost">
            Customer portal
          </Button>
        </form>
      ) : null}
    </MemberShell>
  );
}
