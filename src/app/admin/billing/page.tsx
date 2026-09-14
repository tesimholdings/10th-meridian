import { AdminShell } from "@/components/admin/admin-shell";
import { membershipProducts } from "@/lib/config/pricing";

export const metadata = { title: "Billing admin", robots: { index: false } };

export default function AdminBillingPage() {
  return (
    <AdminShell title="Pricing configuration">
      <p className="text-ivory-muted">
        Approved: Lifetime Membership at $10,000, one time. Create a Stripe Price
        with that amount (mode: payment, not subscription) and paste the ID into
        <span className="text-ivory"> STRIPE_LIFETIME_PRICE_ID</span>. Checkout
        remains stubbed until keys exist. Monthly billing will come later — do not
        add a monthly product to the public section yet.
      </p>
      <ul className="mt-8 grid gap-3">
        {Object.values(membershipProducts).map((p) => (
          <li key={p.id} className="panel p-4">
            <p className="font-serif text-2xl">{p.name}</p>
            <p className="mt-2 text-gold">{p.priceLabel}</p>
            <p className="mt-1 text-sm text-ivory-dim">
              Stripe price: {p.stripePriceId ?? "unset"}
            </p>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
