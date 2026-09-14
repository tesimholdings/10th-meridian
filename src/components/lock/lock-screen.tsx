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
      <div className="safe-pad safe-top mx-auto flex min-h-dvh max-w-6xl flex-col justify-between pb-16 pt-4 md:py-16">
        <header className="flex items-start justify-between gap-6">
          <Wordmark compact />
          <p className="hidden max-w-[12rem] text-right text-[11px] leading-relaxed tracking-[0.16em] uppercase text-ivory-muted md:block">
            Invitation only
          </p>
        </header>

        <main className="mt-8 grid gap-8 md:mt-24 md:grid-cols-[1.25fr_0.75fr] md:items-end">
          <div className="rise">
            <p className="label">A private threshold</p>
            <h1 className="mt-3 max-w-xl font-serif text-[2.85rem] leading-[0.92] md:text-7xl">
              {brand.lockLine}
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ivory-muted md:mt-6 md:text-lg">
              {brand.idea} The house is not a directory. It is a room that opens once a month.
            </p>
            {referralEarly ? (
              <p className="mt-4 max-w-md text-sm text-gold">
                Referral holders may enter from 9:00 a.m. {decision.config.timeZone}. General
                doors open at 10:00 a.m.
              </p>
            ) : null}
            <div className="mt-7 md:mt-10">
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

          <div className="rise-delay md:border md:border-[var(--line)] md:bg-black/25 md:p-6 md:backdrop-blur-sm">
            <p className="label mb-4 hidden md:block">Enter</p>
            <div className="grid gap-2">
              <Button href="/sign-in" variant="gold" className="w-full">
                Member Sign In
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button href="/referral" variant="ghost" className="px-3">
                  <span className="md:hidden">Referral</span>
                  <span className="hidden md:inline">Enter Referral</span>
                </Button>
                <Button href="/referral?scan=1" variant="ghost" className="px-3">
                  <span className="md:hidden">Scan QR</span>
                  <span className="hidden md:inline">Scan QR</span>
                </Button>
              </div>
              <Link
                href="/remind"
                className="inline-flex min-h-11 items-center justify-center text-center text-[11px] tracking-[0.18em] uppercase text-ivory-muted"
              >
                Remind me when the doors open
              </Link>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed tracking-[0.08em] text-ivory-dim">
              {brand.scarcity}
            </p>
            <p className="mt-2 hidden text-[11px] leading-relaxed text-ivory-dim md:block">
              Outside this window the full house is not shown. Selection is human.
              A referral is not a promise.
            </p>
          </div>
        </main>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 text-[11px] tracking-[0.16em] uppercase text-ivory-dim">
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
