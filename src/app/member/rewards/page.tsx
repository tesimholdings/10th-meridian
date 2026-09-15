import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { RewardCard } from "@/components/rewards/reward-card";
import { ReferPanel } from "@/components/rewards/refer-panel";
import { ActivityPanel } from "@/components/rewards/activity-panel";
import { viewerRewardsSnapshot } from "@/lib/preview/store";
import { formatPoints, formatUsd } from "@/lib/rewards/math";
import {
  REWARDS_EDITORIAL,
  REWARDS_EARN,
  REWARDS_HEADLINE,
  REWARDS_LIFETIME,
  REWARDS_MEMBERS_ONLY,
  REWARDS_NOT_INVESTMENT,
  REWARDS_PARITY,
  REWARDS_POLICY,
  REWARDS_SCARCITY,
} from "@/lib/rewards/copy";
import { REFERRAL_REWARDS, REWARDS_TAB_ACTIVITY, REWARDS_TAB_REFER, REWARDS_TAB_REWARDS } from "@/lib/copy/ui";
import type { AppRole } from "@/lib/data/types";

export const metadata = { title: REFERRAL_REWARDS, robots: { index: false } };

const memberRoles: AppRole[] = ["member", "moderator", "administrator"];

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const access = await resolveAccessContext();
  const params = await searchParams;
  const tab = params.tab === "refer" || params.tab === "activity" ? params.tab : "rewards";
  const isMember = Boolean(access.user?.role && memberRoles.includes(access.user.role));

  if (!isMember) {
    return (
      <MemberShell user={access.user} demo title={REFERRAL_REWARDS}>
        <h1 className="font-serif text-4xl">{REWARDS_HEADLINE}</h1>
        <p className="mt-4 max-w-md text-[var(--navy-soft)]">{REWARDS_MEMBERS_ONLY}</p>
        <p className="mt-2 text-sm text-[var(--ivory-dim)]">{REWARDS_LIFETIME}</p>
        <Link href="/member/settings#billing" className="mt-6 inline-flex text-sm text-[var(--blue)]">
          Account settings
        </Link>
      </MemberShell>
    );
  }

  const snapshot = viewerRewardsSnapshot();

  return (
    <MemberShell user={access.user} demo title={REFERRAL_REWARDS}>
      <p className="text-sm text-[var(--ivory-dim)]">{REWARDS_HEADLINE}</p>
      <p className="mt-1 font-serif text-5xl tracking-tight">{formatPoints(snapshot.availablePoints)}</p>
      <p className="mt-2 text-sm text-[var(--navy-soft)]">Available · {REWARDS_PARITY}</p>
      <p className="mt-1 text-sm text-[var(--ivory-dim)]">
        {formatPoints(snapshot.earnedPoints)} earned · {formatPoints(snapshot.reservedPoints)} reserved · {formatPoints(snapshot.redeemedPoints)} redeemed
        <span className="block mt-1">{formatUsd(snapshot.availableUsd)} redemption value</span>
      </p>

      <p className="mt-6 max-w-xl text-sm leading-relaxed text-[var(--navy-soft)]">{REWARDS_EARN}</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--navy-soft)]">{REWARDS_SCARCITY}</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--navy-soft)]">{REWARDS_POLICY}</p>

      <nav className="mt-8 flex gap-2 border-b border-[var(--line)]" aria-label="Referral Rewards">
        <Tab href="/member/rewards" on={tab === "rewards"}>
          {REWARDS_TAB_REWARDS}
        </Tab>
        <Tab href="/member/rewards?tab=refer" on={tab === "refer"}>
          {REWARDS_TAB_REFER}
        </Tab>
        <Tab href="/member/rewards?tab=activity" on={tab === "activity"}>
          {REWARDS_TAB_ACTIVITY}
        </Tab>
      </nav>

      <div className="mt-6">
        {tab === "rewards" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {snapshot.cards.map((card) => (
              <RewardCard key={card.item.id} card={card} />
            ))}
          </div>
        ) : null}
        {tab === "refer" ? <ReferPanel snapshot={snapshot} /> : null}
        {tab === "activity" ? <ActivityPanel snapshot={snapshot} /> : null}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-[var(--ivory-dim)]">{REWARDS_EDITORIAL}</p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--ivory-dim)]">{REWARDS_NOT_INVESTMENT}</p>
    </MemberShell>
  );
}

function Tab({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`min-h-11 flex-1 text-center text-sm ${on ? "border-b-2 border-[var(--gold)]" : "text-[var(--ivory-dim)]"}`}
    >
      {children}
    </Link>
  );
}
