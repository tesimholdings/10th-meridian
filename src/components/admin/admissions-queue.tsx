"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/data/types";

export function AdmissionsQueue({
  applications,
  cap,
  accepted,
  remaining,
  cohortMonth,
}: {
  applications: ApplicationRecord[];
  cap: number;
  accepted: number;
  remaining: number;
  cohortMonth: string;
}) {
  const router = useRouter();
  const [override, setOverride] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function act(id: string, action: "status" | "next_cohort", status?: ApplicationStatus) {
    const res = await fetch("/api/admin/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, status, override }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setNote(json.message ?? (json.ok ? "Updated." : "Could not update."));
    router.refresh();
  }

  return (
    <div>
      <p className="text-ivory-muted">
        Cohort {cohortMonth}. Cap {cap}. Accepted {accepted}. Remaining {remaining}.
        Selection is human — no algorithm grants membership.
      </p>
      <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-ivory-muted">
        <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="h-5 w-5" />
        Steward override (logged) if the month is full
      </label>
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
      <ul className="mt-8 grid gap-4">
        {applications.map((a) => (
          <li key={a.id} className="border border-[var(--line)] p-4">
            <p className="font-serif text-2xl">{a.fullName}</p>
            <p className="text-sm text-ivory-muted">
              {a.status.replaceAll("_", " ")} · {a.city} · {a.cohortMonth} · DEMO
              {a.referralCode ? " · Referred Applicant" : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip onClick={() => void act(a.id, "status", "under_review")}>Under Review</Chip>
              <Chip onClick={() => void act(a.id, "status", "approved_payment_pending")}>Approve</Chip>
              <Chip onClick={() => void act(a.id, "status", "waitlisted")}>Waitlist</Chip>
              <Chip onClick={() => void act(a.id, "next_cohort")}>Next cohort</Chip>
              <Chip onClick={() => void act(a.id, "status", "declined")}>Decline</Chip>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.14em] uppercase"
    >
      {children}
    </button>
  );
}
