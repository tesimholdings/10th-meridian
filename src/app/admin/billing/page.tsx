import { AdminShell } from "@/components/admin/admin-shell";
import { membershipProducts } from "@/lib/config/pricing";

export const metadata = { title: "Billing admin", robots: { index: false } };

export default function AdminBillingPage() {
  return (
    <AdminShell title="Pricing configuration">
      <p className="text-ivory-muted">
        Lifetime membership is approved at $10,000. Monthly billing is not offered
        yet. Paste a Stripe Price ID for the lifetime product when checkout goes live.
      </p>
      <ul className="mt-8 grid gap-3">
        {Object.values(membershipProducts).map((p) => (
          <li key={p.id} className="border border-[var(--line)] p-4">
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
