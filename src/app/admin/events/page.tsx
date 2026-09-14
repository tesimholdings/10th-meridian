import { AdminShell } from "@/components/admin/admin-shell";
import { getPreviewStore } from "@/lib/preview/store";

export const metadata = { title: "Events admin", robots: { index: false } };

export default function AdminEventsPage() {
  return (
    <AdminShell title="Events">
      <ul className="grid gap-3">
        {getPreviewStore().events.map((e) => (
          <li key={e.id} className="border border-[var(--line)] p-4">
            <p className="label">{e.listingState}</p>
            <p className="font-serif text-2xl">{e.title}</p>
            <p className="text-sm text-ivory-muted">{e.summary}</p>
            <p className="mt-2 text-[11px] text-gold">
              {e.registered}/{e.capacity} listed · {e.waitlist} waitlist
            </p>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}