"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReferralRecord } from "@/lib/data/types";
import { Button } from "@/components/ui/button";

export function ReferralDesk({
  referrals,
  siteUrl,
}: {
  referrals: ReferralRecord[];
  siteUrl: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function create() {
    const res = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", code, label, maxUses: 10 }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setNote(json.message ?? "");
    setCode("");
    router.refresh();
  }

  async function revoke(id: string) {
    const res = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", id }),
    });
    const json = (await res.json()) as { message?: string };
    setNote(json.message ?? "Revoked.");
    router.refresh();
  }

  return (
    <div>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <label className="grid gap-2">
          <span className="label">New code</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="TENTH-HOST" />
        </label>
        <label className="grid gap-2">
          <span className="label">Audit note / label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Dinner host, October" />
        </label>
        <Button type="submit">Issue referral</Button>
      </form>
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
      <ul className="mt-8 grid gap-3">
        {referrals.map((r) => (
          <li key={r.id} className="border border-[var(--line)] p-4">
            <p className="font-serif text-2xl">{r.code}</p>
            <p className="text-sm text-ivory-muted">
              {r.label} · {r.useCount}/{r.maxUses}
              {r.revokedAt ? " · revoked" : ""}
            </p>
            <p className="mt-2 text-[11px] text-ivory-dim">
              QR {siteUrl}/api/referrals/qr?code={r.code}
            </p>
            {!r.revokedAt ? (
              <button
                type="button"
                className="mt-3 min-h-11 text-[11px] tracking-[0.16em] uppercase text-gold"
                onClick={() => void revoke(r.id)}
              >
                Revoke
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
