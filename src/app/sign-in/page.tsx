import { SignInForm } from "@/components/auth/sign-in-form";
import { PublicShell } from "@/components/open-house/public-shell";
import { env } from "@/lib/env";

export const metadata = { title: "Member Sign In", robots: { index: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">Member Sign In</h1>
      <p className="mt-3 text-sm text-[var(--navy-soft)]">
        Members enter with a username or the email on their account.
      </p>
      <SignInForm failed={params.error === "1"} />
      {env.previewTools ? (
        <p className="mt-6 text-[12px] text-[var(--navy-soft)]">
          Preview tools on the lock screen can place you in a member or steward
          session without a password.
        </p>
      ) : null}
    </PublicShell>
  );
}
