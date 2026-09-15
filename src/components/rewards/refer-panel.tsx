"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { postRewards } from "@/lib/rewards/http";
import { REWARDS_POLICY, REWARDS_SCARCITY } from "@/lib/rewards/copy";
import type { MemberReferral, RewardsSnapshot } from "@/lib/rewards/types";

const pipeline = ["submitted", "invited", "applied", "admitted", "credited"] as const;

export function ReferPanel({ snapshot }: { snapshot: RewardsSnapshot }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setStatus("Copy the link from the field.");
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-3xl bg-white p-5">
        <p className="label">Your referral</p>
        <p className="mt-2 font-serif text-3xl">{snapshot.code}</p>
        <p className="mt-2 break-all text-sm text-[var(--navy-soft)]">{snapshot.link}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void copy(snapshot.link)}>
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button type="button" variant="ghost" className="house-light-btn" onClick={() => void copy(snapshot.code)}>
            Copy code
          </Button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--navy-soft)]">{REWARDS_SCARCITY}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--navy-soft)]">{REWARDS_POLICY}</p>
      </section>

      <ReferralForm
        onDone={(message) => {
          setStatus(message);
          router.refresh();
        }}
      />

      {status ? <p className="text-sm text-[var(--blue)]">{status}</p> : null}

      <section>
        <h2 className="font-serif text-2xl">Your referrals</h2>
        {snapshot.referrals.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ivory-dim)]">None yet. A name and a note are enough to start.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {snapshot.referrals.map((row) => (
              <ReferralRow key={row.id} row={row} onChange={() => router.refresh()} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReferralForm({ onDone }: { onDone: (message: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    const json = await postRewards({
      action: "submit-referral",
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      linkedin: String(formData.get("linkedin") ?? "") || undefined,
      city: String(formData.get("city") ?? ""),
      howYouKnowThem: String(formData.get("howYouKnowThem") ?? ""),
      note: String(formData.get("note") ?? "") || undefined,
    });
    setBusy(false);
    onDone(json.ok ? "Submitted. The house will take it from here." : json.message ?? "Could not submit.");
  }

  return (
    <form
      className="grid gap-3 rounded-3xl bg-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(new FormData(e.currentTarget));
        e.currentTarget.reset();
      }}
    >
      <h2 className="font-serif text-2xl">Introduce someone</h2>
      <label className="grid gap-1">
        <span className="label">Full name</span>
        <input name="fullName" required />
      </label>
      <label className="grid gap-1">
        <span className="label">Email</span>
        <input name="email" type="email" required />
      </label>
      <label className="grid gap-1">
        <span className="label">LinkedIn or URL</span>
        <input name="linkedin" type="url" placeholder="https://" />
      </label>
      <label className="grid gap-1">
        <span className="label">City</span>
        <input name="city" required />
      </label>
      <label className="grid gap-1">
        <span className="label">How you know them</span>
        <textarea name="howYouKnowThem" rows={3} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Note</span>
        <textarea name="note" rows={2} />
      </label>
      <Button type="submit" disabled={busy}>
        Submit referral
      </Button>
    </form>
  );
}

function ReferralRow({ row, onChange }: { row: MemberReferral; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const paid = row.credited ? "+10 pts credited" : "No points yet";

  async function act(action: string) {
    setBusy(true);
    await postRewards({ action, id: row.id });
    setBusy(false);
    onChange();
  }

  return (
    <li className="rounded-3xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-sm text-[var(--ivory-dim)]">
            {row.city} · {row.email}
          </p>
        </div>
        <p className="text-sm text-[var(--gold-dim)]">{paid}</p>
      </div>
      <ol className="mt-3 flex flex-wrap gap-1 text-[11px]">
        {pipeline.map((step) => (
          <li
            key={step}
            className={`rounded-full px-2 py-1 ${
              row.status === step ? "bg-[var(--navy)] text-[var(--paper)]" : "bg-[rgba(9,43,69,0.06)] text-[var(--ivory-dim)]"
            }`}
          >
            {step}
          </li>
        ))}
        {row.status === "declined" || row.status === "withdrawn" ? (
          <li className="rounded-full bg-[rgba(180,85,74,0.12)] px-2 py-1 text-[var(--danger)]">{row.status}</li>
        ) : null}
      </ol>
      <p className="mt-2 text-sm text-[var(--navy-soft)]">{row.howYouKnowThem}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {row.status !== "credited" && row.status !== "declined" && row.status !== "withdrawn" ? (
          <>
            <button
              type="button"
              className="action-quiet"
              disabled={busy}
              onClick={() => void act("advance-referral")}
            >
              Preview: advance
            </button>
            <button
              type="button"
              className="action-quiet"
              disabled={busy}
              onClick={() => void act("withdraw-referral")}
            >
              Withdraw
            </button>
          </>
        ) : null}
      </div>
    </li>
  );
}
