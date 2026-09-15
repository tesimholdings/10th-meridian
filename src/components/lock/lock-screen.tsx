import Link from "next/link";
import { FormalLockup } from "@/components/brand/logo";
import { Countdown } from "@/components/cinematic/countdown";
import { LockGrain } from "@/components/lock/lock-grain";
import { LockUnlock } from "@/components/lock/lock-unlock";
import { brand } from "@/lib/config/site";
import type { AccessDecision } from "@/lib/access/open-house";

export function LockScreen({
  decision,
  referralEarly = false,
  unlockDenied = false,
}: {
  decision: AccessDecision;
  referralEarly?: boolean;
  unlockDenied?: boolean;
}) {
  return (
    <div className="lock-gold relative min-h-dvh overflow-hidden text-ivory">
      <LockGrain />
      <div className="safe-pad safe-top relative z-10 mx-auto flex min-h-dvh w-full max-w-[90rem] flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <FormalLockup
            knockout
            className="h-auto w-[min(92vw,28rem)] md:w-[min(80vw,36rem)]"
          />
          <h1 className="mt-10 max-w-lg font-serif text-2xl leading-tight text-ivory/80 md:text-3xl">
            {brand.lockLine}
          </h1>
          <div className="mt-8 w-full max-w-md">
            <Countdown
              targetIso={decision.nextOpenAt}
              serverNowIso={decision.serverNowIso}
              label={referralEarly ? "Until general doors" : "Until the next tenth"}
            />
          </div>
          <div className="mt-10 w-full">
            <LockUnlock denied={unlockDenied} />
          </div>
          <p className="mt-8">
            <Link href="/remind" className="text-sm text-ivory/50 hover:text-ivory">
              Remind me
            </Link>
          </p>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pb-10 text-sm text-ivory/55 md:justify-between">
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
