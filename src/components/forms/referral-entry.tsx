"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReferralEntry({ scanHint = false }: { scanHint?: boolean }) {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    const code = String(formData.get("code") ?? "");
    const res = await fetch("/api/referrals/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setStatus(
      json.message ??
        (json.ok
          ? "A referral opens the door earlier. What happens next is still earned."
          : "That code cannot be used."),
    );
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {scanHint ? (
        <p className="text-sm text-ivory-muted">
          Camera scanning is a later enhancement. Paste the code or token from the QR
          payload for now. QR images are generated server-side for issued codes.
        </p>
      ) : null}
      <label className="grid gap-2">
        <span className="label">Referral code or link token</span>
        <input name="code" required autoCapitalize="characters" placeholder="TENTH-EARLY" />
      </label>
      <Button type="submit">Confirm</Button>
      {status ? <p className="text-sm text-gold">{status}</p> : null}
      <p className="text-[12px] text-ivory-dim">
        We will not say whether a code has already been used. Invalid, expired, revoked,
        and exhausted codes fail the same way.
      </p>
    </form>
  );
}
