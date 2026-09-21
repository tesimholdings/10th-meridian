"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FORGOT_PASSWORD_MESSAGE, UNLOCK_MISS_MESSAGE } from "@/lib/lock/unlock";

type Mode = "identity" | "password" | "referral";

export function LockUnlock({ denied = false }: { denied?: boolean }) {
  const [mode, setMode] = useState<Mode>("identity");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(denied);
  const [notice, setNotice] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "password") passwordRef.current?.focus();
  }, [mode]);

  async function submitUnlock(body: {
    key: string;
    password?: string;
    referral?: "1";
  }) {
    const res = await fetch("/api/lock/unlock", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return (await res.json().catch(() => null)) as
      | { ok?: boolean; redirect?: string; next?: string; message?: string }
      | null;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nextKey = String(data.get("key") ?? "");
    const password = String(data.get("password") ?? "");
    setBusy(true);
    setError(false);
    setNotice(null);
    try {
      const body =
        mode === "password"
          ? { key: nextKey, password }
          : mode === "referral"
            ? { key: nextKey, referral: "1" as const }
            : { key: nextKey };
      const json = await submitUnlock(body);
      if (json?.ok && json.redirect) {
        window.location.assign(json.redirect);
        return;
      }
      if (json?.ok && json.next === "password") {
        setKey(nextKey);
        setShowPassword(false);
        setMode("password");
        setBusy(false);
        return;
      }
      setError(true);
    } catch {
      setError(true);
    }
    setBusy(false);
  }

  async function onForgot() {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identity: key }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setNotice(data?.message ?? FORGOT_PASSWORD_MESSAGE);
    } catch {
      setNotice(FORGOT_PASSWORD_MESSAGE);
    }
    setBusy(false);
  }

  const submitLabel = mode === "identity" ? "Continue" : "Enter";
  const keyLabel =
    mode === "referral" ? "Referral code" : "Username or email";

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
        value={key}
        onChange={(event) => setKey(event.target.value)}
        autoComplete={mode === "referral" ? "off" : "username"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label={keyLabel}
        placeholder={keyLabel}
      />
      {mode === "password" ? (
        <div className="lock-unlock-secret mt-3">
          <div className="lock-password">
            <input
              ref={passwordRef}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-label="Password"
              placeholder="Password"
            />
            <button
              type="button"
              className="lock-reveal"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((open) => !open)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-3">
            <button
              type="button"
              className="lock-forgot"
              onClick={onForgot}
              disabled={busy}
            >
              Forgot password
            </button>
          </p>
        </div>
      ) : null}
      {mode === "referral" ? (
        <input type="hidden" name="referral" value="1" />
      ) : null}
      <Button type="submit" className="lock-enter mt-4 w-full" disabled={busy}>
        {submitLabel}
      </Button>
      {mode === "identity" ? (
        <p className="mt-4">
          <button
            type="button"
            className="lock-text-link"
            onClick={() => {
              setMode("referral");
              setKey("");
              setError(false);
              setNotice(null);
            }}
          >
            Have a referral code?
          </button>
        </p>
      ) : (
        <p className="mt-4">
          <button
            type="button"
            className="lock-text-link"
            onClick={() => {
              setMode("identity");
              setShowPassword(false);
              if (mode === "referral") setKey("");
              setError(false);
              setNotice(null);
            }}
          >
            {mode === "referral" ? "Use username" : "Use a different name"}
          </button>
        </p>
      )}
      {notice ? (
        <p className="mt-4 text-sm text-ivory/50" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-ivory/50" role="status">
          {UNLOCK_MISS_MESSAGE}
        </p>
      ) : null}
    </form>
  );
}
