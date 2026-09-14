import Link from "next/link";
import { MotionControl } from "@/components/ui/motion-system";
import { Wordmark } from "@/components/brand/logo";
import { HeroStage } from "@/components/cinematic/hero-stage";
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
    <HeroStage>
      <div className="threshold safe-pad mx-auto flex min-h-dvh max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4 py-7 md:py-10">
          <Wordmark compact />
          <div className="flex items-center gap-3">
            <MotionControl />
            <Link href="/sign-in" className="threshold-signin">
              Member sign in <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>
        <main className="threshold-main">
          <div data-reveal>
            <p className="label flex items-center gap-3">
              <span className="signal-dot" /> A private threshold
            </p>
            <h1 className="threshold-title">
              The doors open
              <br />
              on <em>the tenth.</em>
            </h1>
            <p className="threshold-copy">
              {brand.idea}
              <br />A private house. A world of possibility.
            </p>
            {referralEarly ? (
              <p className="mt-5 max-w-md text-sm text-gold">
                Referral holders may enter from 9:00 a.m.{" "}
                {decision.config.timeZone}. General doors open at 10:00 a.m.
              </p>
            ) : null}
            <div className="mt-8 md:mt-12">
              <Countdown
                targetIso={decision.nextOpenAt}
                serverNowIso={decision.serverNowIso}
                label={
                  referralEarly ? "Until general doors" : "The next opening"
                }
              />
            </div>
          </div>
          <div className="threshold-entry" data-reveal>
            <p className="label">An invitation to something rare</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Good things are
              <br className="hidden md:block" /> worth waiting for.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory-muted">
              {brand.scarcity}
            </p>
            <Button href="/remind" variant="ivory" className="mt-6 w-full">
              Remind me when doors open{" "}
              <span aria-hidden="true" className="ml-3">
                ↗
              </span>
            </Button>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-1">
              <Link href="/referral" className="quiet-link">
                Have a referral? <span aria-hidden="true">→</span>
              </Link>
              <Link href="/referral?scan=1" className="quiet-link">
                Scan QR <span aria-hidden="true">⌗</span>
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ivory-muted">
              Selection is human. A referral is not a promise.
            </p>
          </div>
        </main>
        <footer className="threshold-footer flex flex-wrap items-center justify-between gap-3">
          <p className="label !text-ivory-muted">
            10° · A world of uncommon connection
          </p>
          <div className="flex gap-4 text-xs text-ivory-muted">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/community">Community</Link>
          </div>
        </footer>
      </div>
    </HeroStage>
  );
}
