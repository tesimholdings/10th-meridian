import { Wordmark } from "@/components/brand/logo";
import { RemindForm } from "@/components/forms/remind-form";

export const metadata = { title: "Remind me" };

export default function RemindPage() {
  return (
    <div className="safe-pad mx-auto flex min-h-dvh max-w-md flex-col justify-center py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">When the tenth returns</h1>
      <p className="mt-3 text-sm text-ivory-muted">
        Outside Open House we keep only a reminder. The waitlist and application
        wait for the doors.
      </p>
      <div className="mt-8">
        <RemindForm />
      </div>
    </div>
  );
}
