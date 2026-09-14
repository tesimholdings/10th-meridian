import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MatchBoard } from "@/components/matches/match-board";
import { viewerProfile, getPreviewStore } from "@/lib/preview/store";
import { demoIndexFor } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Matches", robots: { index: false } };

export default async function MatchesPage() {
  const access = await resolveAccessContext();
  const viewer = viewerProfile();
  const index = await demoIndexFor(viewer);
  const intros = getPreviewStore().intros;
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess || viewer.isDemo} title="The Meridian Index">
      <h1 className="max-w-xl font-serif text-4xl leading-tight md:text-5xl">{brand.matchingLine}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory-dim">
        Hybrid scoring: complementary ask/offer, goals, interests, industry,
        geography, availability, and novelty. Semantic embeddings are a supplement,
        never the whole decision. Protected traits are not ranking factors.
        Relevant / not relevant changes this list.
      </p>
      <div className="mt-10">
        <MatchBoard index={index} intros={intros} />
      </div>
    </MemberShell>
  );
}
