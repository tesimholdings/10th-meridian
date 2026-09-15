"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { UNLOCK_MISS_MESSAGE } from "@/lib/lock/unlock";

export function LockUnlock({ denied = false }: { denied?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(denied);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const key = String(new FormData(form).get("key") ?? "");
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/lock/unlock", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; redirect?: string }
        | null;
      if (data?.ok && data.redirect) {
        window.location.assign(data.redirect);
        return;
      }
      setError(true);
    } catch {
      setError(true);
    }
    setBusy(false);
  }

  return (
    <form
      action="/api/lock/unlock"
      method="post"
      onSubmit={onSubmit}
      className="lock-unlock mx-auto w-full max-w-[22rem]"
    >
      <input
        name="key"
        type="text"
        autoComplete="username"
        spellCheck={false}
        aria-label="Referral code, email, or username"
        placeholder="Referral code, email, or username"
      />
      <Button type="submit" className="lock-enter mt-4 w-full" disabled={busy}>
        Enter
      </Button>
      {error ? (
        <p className="mt-4 text-sm text-ivory/50" role="status">
          {UNLOCK_MISS_MESSAGE}
        </p>
      ) : null}
    </form>
  );
}
