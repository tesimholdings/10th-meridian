import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/open-house/public-shell";
import { env } from "@/lib/env";

export const metadata = { title: "Member Sign In", robots: { index: false } };

export default function SignInPage() {
  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">Member Sign In</h1>
      <p className="mt-3 text-sm text-[var(--navy-soft)]">
        Members enter with the email on their account.
      </p>
      <form action="/api/auth/sign-in" method="post" className="mt-8 grid gap-4">
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="grid gap-2">
          <span className="label">Password</span>
          <input name="password" type="password" autoComplete="current-password" />
        </label>
        <Button type="submit">Enter</Button>
      </form>
      {env.previewTools ? (
        <p className="mt-6 text-[12px] text-[var(--navy-soft)]">
          Preview tools on the lock screen can place you in a member or steward
          session without a password.
        </p>
      ) : null}
    </PublicShell>
  );
}
