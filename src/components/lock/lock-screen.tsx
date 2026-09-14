import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { HeroStage } from "@/components/cinematic/hero-stage";
import { Countdown } from "@/components/cinematic/countdown";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/site";
import type { AccessDecision } from "@/lib/access/open-house";
import { EDITORIAL_CAPTION } from "@/lib/atmosphere/campaign";
import { campaignSrc } from "@/lib/atmosphere/resolve-campaign";

export function LockScreen({
  decision,
  referralEarly = false,
}: {
  decision: AccessDecision;
  referralEarly?: boolean;
}) {
  return (
    <HeroStage
      caption={EDITORIAL_CAPTION}
      src={campaignSrc("heroLandscape")}
      mobileSrc={campaignSrc("heroMobile")}
    >
      <div className="safe-pad safe-top mx-auto flex min-h-dvh max-w-6xl flex-col justify-between pb-16 pt-4 md:py-16">
        <header className="flex items-center justify-between">
          <Wordmark compact />
          <Link href="/sign-in" className="min-h-11 text-sm text-ivory">
            Sign in
          </Link>
        </header>

        <main className="rise mt-8 max-w-xl">
          <h1 className="font-serif text-[2.7rem] leading-[0.95] text-ivory md:text-6xl">
            {brand.lockLine}
          </h1>
          <div className="mt-8">
            <Countdown
              targetIso={decision.nextOpenAt}
              serverNowIso={decision.serverNowIso}
              label={referralEarly ? "Until general doors" : "Until the next tenth"}
            />
          </div>
          <div className="mt-8">
            <Button href="/remind" variant="ivory" className="w-full sm:w-auto">
              Remind me
            </Button>
          </div>
        </main>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm text-ivory/70">
          <p>{brand.name}</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
          </div>
        </footer>
      </div>
    </HeroStage>
  );
}
