import { AdminShell } from "@/components/admin/admin-shell";
import { demoEvents } from "@/lib/data/demo";

export const metadata = { title: "Events admin", robots: { index: false } };

export default function AdminEventsPage() {
  return (
    <AdminShell title="Events">
      <ul className="grid gap-3">
        {demoEvents.map((e) => (
          <li key={e.id} className="border border-[var(--line)] p-4">
            <p className="font-serif text-2xl">{e.title}</p>
            <p className="text-sm text-ivory-muted">{e.summary}</p>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
