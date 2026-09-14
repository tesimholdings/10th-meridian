import { AdminShell } from "@/components/admin/admin-shell";
import { membershipProducts } from "@/lib/config/pricing";

export const metadata = { title: "Billing admin", robots: { index: false } };

export default function AdminBillingPage() {
  return (
    <AdminShell title="Pricing configuration">
      <p className="text-ivory-muted">
        Do not invent amounts. Labels stay as approved-price placeholders until
        finance signs off and Stripe Price IDs are pasted into env / site_config.
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
