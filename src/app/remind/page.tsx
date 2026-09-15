import { RemindForm } from "@/components/forms/remind-form";
import { PublicShell } from "@/components/open-house/public-shell";

export const metadata = { title: "Remind me" };

export default function RemindPage() {
  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">When the tenth returns</h1>
      <p className="mt-3 text-sm text-[var(--navy-soft)]">
        Outside Open House we keep only a reminder. The waitlist and application
        wait for the doors.
      </p>
      <div className="mt-8">
        <RemindForm />
      </div>
    </PublicShell>
  );
}
