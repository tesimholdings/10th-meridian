import Link from "next/link";
import { FormalLockup } from "@/components/brand/logo";
import { Countdown } from "@/components/cinematic/countdown";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/site";
import type { AccessDecision } from "@/lib/access/open-house";

export function LockScreen({
  decision,
  referralEarly = false,
}: {
  decision: AccessDecision;
  referralEarly?: boolean;
}) {
  return (
    <div className="lock-gold relative min-h-dvh overflow-hidden text-ivory">
      <div className="lock-gold-glow" aria-hidden />
      <div className="grain lock-gold-grain" aria-hidden />
      <div className="safe-pad safe-top relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col md:max-w-4xl">
        <header className="flex items-center justify-between py-4 md:py-6">
          <FormalLockup className="h-12 w-auto max-w-[min(100%,18rem)]" />
          <Link href="/sign-in" className="min-h-11 text-sm text-ivory">
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
          <h1 className="max-w-xl font-serif text-[2.7rem] leading-[0.95] text-ivory md:text-6xl">
            {brand.lockLine}
          </h1>
          <div className="mt-10 w-full max-w-md">
            <Countdown
              targetIso={decision.nextOpenAt}
              serverNowIso={decision.serverNowIso}
              label={referralEarly ? "Until general doors" : "Until the next tenth"}
            />
          </div>
          <div className="mt-10">
            <Button href="/remind" variant="ivory">
              Remind me
            </Button>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pb-10 text-sm text-ivory/70 md:justify-between">
          <p>{brand.name}</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
