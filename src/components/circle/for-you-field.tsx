import { IndexCard } from "@/components/matches/match-board";
import type { IntroRequest } from "@/lib/data/types";
import type { ScoredMatch } from "@/lib/matching/types";
import { shortMatchReason } from "@/lib/matching/reason";
import { recommendationsToRender } from "@/lib/member/recommendations";

const CURATED = 10;

export function ForYouField({
  rows,
  intros,
  circleIds,
}: {
  rows: ScoredMatch[];
  intros: IntroRequest[];
  circleIds: string[];
}) {
  const shown = recommendationsToRender(rows, CURATED);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--ivory-dim)]">No one in this frame. Profiles are never invented.</p>;
  }

  return (
    <ul className="stagger-in grid gap-1">
      {shown.map((row) => (
        <IndexCard
          key={row.target.id}
          className="circle-person"
          profile={row.target}
          reason={shortMatchReason(row.target, row.explanations)}
          intro={intros.find((item) => item.targetId === row.target.id)}
          inCircle={circleIds.includes(row.target.id)}
        />
      ))}
    </ul>
  );
}
