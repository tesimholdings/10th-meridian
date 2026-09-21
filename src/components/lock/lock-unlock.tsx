"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FORGOT_PASSWORD_MESSAGE, UNLOCK_MISS_MESSAGE } from "@/lib/lock/unlock";

type Mode = "identity" | "password" | "referral";

function PasswordEye({ off }: { off: boolean }) {
  return (
    <svg
      className="lock-eye"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {off ? (
        <>
          <path
            d="M3.2 4.4 20.2 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9.4 6.2A11 11 0 0 1 12 5.6c6.2 0 9.6 6.4 9.6 6.4a17 17 0 0 1-3.5 4.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 7.7C4.2 9.2 2.4 12 2.4 12S5.8 18.4 12 18.4c1.4 0 2.7-.3 3.8-.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.9 10.2a2.5 2.5 0 0 0 3.5 3.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M2.2 12S5.7 5.4 12 5.4 21.8 12 21.8 12 18.3 18.6 12 18.6 2.2 12 2.2 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="2.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </>
      )}
    </svg>
  );
}

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
              <PasswordEye off={showPassword} />
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
