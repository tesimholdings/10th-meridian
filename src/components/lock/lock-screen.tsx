import Link from "next/link";
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
      <div className="safe-pad mx-auto flex min-h-dvh max-w-6xl flex-col justify-between py-10 md:py-16">
        <header className="flex items-start justify-between gap-6">
          <Wordmark />
          <p className="hidden max-w-[12rem] text-right text-[11px] leading-relaxed tracking-[0.16em] uppercase text-ivory-muted md:block">
            Invitation only
          </p>
        </header>

        <main className="mt-16 grid gap-12 md:mt-24 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="label">A private threshold</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] md:text-7xl">
              {brand.lockLine}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory-muted">
              {brand.idea} The house is not a directory. It is a room that opens once a month.
            </p>
            {referralEarly ? (
              <p className="mt-4 max-w-md text-sm text-gold">
                Referral holders may enter from 9:00 a.m. {decision.config.timeZone}. General
                doors open at 10:00 a.m.
              </p>
            ) : null}
            <div className="mt-10">
              <Countdown
                targetIso={decision.nextOpenAt}
                serverNowIso={decision.serverNowIso}
                label={
                  referralEarly
                    ? "Until general doors"
                    : "Until the next tenth"
                }
              />
            </div>
          </div>

          <div className="border border-[var(--line)] bg-black/25 p-6 backdrop-blur-sm">
            <p className="label">Enter</p>
            <div className="mt-5 grid gap-3">
              <Button href="/sign-in" variant="gold">
                Member Sign In
              </Button>
              <Button href="/referral" variant="ghost">
                Enter Referral Code
              </Button>
              <Button href="/referral?scan=1" variant="ghost">
                Scan Referral QR
              </Button>
              <Button href="/remind" variant="ivory">
                Remind Me When the Doors Open
              </Button>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-ivory-muted">
              {brand.scarcity}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-ivory-dim">
              Outside this window the full house is not shown. Selection is human.
              A referral is not a promise.
            </p>
          </div>
        </main>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 text-[11px] tracking-[0.16em] uppercase text-ivory-dim">
          <p>{brand.name}</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/community">Community</Link>
          </div>
        </footer>
      </div>
    </HeroStage>
  );
}
