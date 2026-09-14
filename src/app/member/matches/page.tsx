import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MeridianLists } from "@/components/matches/meridian-lists";
import { viewerDemoProfile } from "@/lib/data/demo";
import { demoIndexFor } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Matches", robots: { index: false } };

export default async function MatchesPage() {
  const access = await resolveAccessContext();
  const index = await demoIndexFor(viewerDemoProfile);
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="The Meridian Index">
      <p className="max-w-xl text-ivory-muted">{brand.matchingLine}</p>
      <p className="mt-3 text-sm text-ivory-dim">
        Hybrid scoring: complementary ask/offer, goals, interests, industry,
        geography, availability, and novelty. Semantic embeddings are a supplement,
        never the whole decision. Protected traits are not ranking factors.
      </p>
      <div className="mt-10">
        <MeridianLists index={index} />
      </div>
    </MemberShell>
  );
}
