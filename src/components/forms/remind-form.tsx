"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RemindForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(json.message ?? (json.ok ? "We will write when the tenth returns." : "Unable to save that just now."));
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-4"
    >
      <label className="grid gap-2">
        <span className="label">Name</span>
        <input name="name" autoComplete="name" />
      </label>
      <label className="grid gap-2">
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <p className="text-sm text-[var(--navy-soft)]">
        This is a reminder, not a waitlist and not an application. Full applications
        open only during Open House.
      </p>
      <Button type="submit">Keep this date</Button>
      {status ? <p className="mt-4 text-sm text-[var(--gold-dim)]">{status}</p> : null}
    </form>
  );
}
