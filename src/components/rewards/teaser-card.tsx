import Link from "next/link";
import { formatPoints } from "@/lib/rewards/math";
import { REWARDS_HEADLINE, REWARDS_PARITY } from "@/lib/rewards/copy";

export function RewardsTeaserCard({
  availablePoints,
  compact = false,
}: {
  availablePoints: number;
  compact?: boolean;
}) {
  return (
    <Link
      href="/member/rewards"
      className={`block rounded-3xl bg-white ${compact ? "px-4 py-4" : "px-5 py-5"}`}
    >
      <p className="text-sm text-[var(--ivory-dim)]">{REWARDS_HEADLINE}</p>
      <p className={`mt-1 font-serif ${compact ? "text-3xl" : "text-4xl"}`}>{formatPoints(availablePoints)}</p>
      <p className="mt-1 text-sm text-[var(--navy-soft)]">{REWARDS_PARITY}</p>
      <p className="mt-3 text-sm text-[var(--blue)]">Open Rewards</p>
    </Link>
  );
}
