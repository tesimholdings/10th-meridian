"use client";

import { useState } from "react";
import { PasswordEye } from "@/components/lock/lock-unlock";
import { Button } from "@/components/ui/button";
import { UNLOCK_MISS_MESSAGE } from "@/lib/lock/unlock";

export function SignInForm({ failed = false }: { failed?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action="/api/auth/sign-in" method="post" className="surface mt-8 grid gap-4 rounded-3xl p-5">
      <label className="grid gap-2">
        <span className="label">Username or email</span>
        <input
          name="identity"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Username or email"
          aria-label="Username or email"
        />
      </label>
      <label className="grid gap-2">
        <span className="label">Password</span>
        <div className="lock-password sign-in-secret">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
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
      </label>
      <Button type="submit">Enter</Button>
      {failed ? (
        <p className="text-sm text-[var(--navy-soft)]" role="status">
          {UNLOCK_MISS_MESSAGE}
        </p>
      ) : null}
    </form>
  );
}
