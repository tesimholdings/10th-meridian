import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { membershipProducts } from "@/lib/config/pricing";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Billing", robots: { index: false } };

export default async function BillingPage() {
  const access = await resolveAccessContext();
  if (!access.decision.isMemberAccess) {
    return (
      <MemberShell user={access.user} demo title="Billing">
        <p className="text-ivory-muted">
          Billing, invoices, and the customer portal are not part of Open House.
        </p>
      </MemberShell>
    );
  }
  return (
    <MemberShell user={access.user} demo={false} title="Billing">
      <p className="text-sm text-ivory-muted">
        Checkout and the customer portal are Stripe-hosted. This house stores
        Stripe references only — never card data.
      </p>
      <div className="mt-8 grid gap-4">
        {Object.values(membershipProducts).map((p) => (
          <article key={p.id} className="border border-[var(--line)] p-5">
            <h2 className="font-serif text-2xl">{p.name}</h2>
            <p className="mt-2 text-sm text-ivory-muted">{p.summary}</p>
            <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-gold">
              {p.priceLabel}
            </p>
            {p.checkoutEligible ? (
              <form action="/api/stripe/checkout" method="post" className="mt-4">
                <input type="hidden" name="product" value={p.id} />
                <Button type="submit" variant="ghost">
                  Stripe Checkout (test-mode ready)
                </Button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-ivory-dim">By application.</p>
            )}
          </article>
        ))}
      </div>
      <form action="/api/stripe/portal" method="post" className="mt-6">
        <Button type="submit" variant="ghost">
          Customer portal
        </Button>
      </form>
    </MemberShell>
  );
}
