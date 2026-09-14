import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

export const metadata = { title: "Member Sign In", robots: { index: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="safe-pad mx-auto flex min-h-dvh max-w-md flex-col justify-center py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">Member Sign In</h1>
      <p className="mt-3 text-sm text-ivory-muted">
        Your house, wherever you are. Sign in to reconnect. This preview uses a
        steward-issued demo session.
      </p>
      {error ? (
        <p role="alert" className="status-message mt-6 text-sm">
          We couldn’t sign you in. Check your email and password, then try
          again.
        </p>
      ) : null}
      <form
        action="/api/auth/sign-in"
        method="post"
        className="mt-8 grid gap-4"
      >
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="grid gap-2">
          <span className="label">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </label>
        <Button type="submit">Enter</Button>
      </form>
      {env.previewDemoAuth ? (
        <p className="mt-6 text-[12px] text-ivory-dim">
          Preview tools on the lock screen can place you in a member or steward
          session without a password.
        </p>
      ) : null}
    </div>
  );
}
