import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MatchBoard } from "@/components/matches/match-board";
import { AskTheMeridian } from "@/components/index/ask-meridian";
import { viewerProfile, getPreviewStore } from "@/lib/preview/store";
import { demoIndexFor } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";
import { MERIDIAN_INDEX, YOUR_CIRCLE } from "@/lib/copy/ui";
import { circleIdsFor } from "@/lib/network/circle";
import Link from "next/link";

export const metadata = { title: MERIDIAN_INDEX, robots: { index: false } };

export default async function IndexPage() {
  const access = await resolveAccessContext();
  const viewer = viewerProfile();
  const store = getPreviewStore();
  const index = await demoIndexFor(viewer);
  const intros = store.intros;
  const circleIds = circleIdsFor(viewer.id, store.circle);
  const circleProfiles = store.profiles.filter((p) => circleIds.includes(p.id));

  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess || viewer.isDemo} title={MERIDIAN_INDEX} scene="yacht">
      <h1 className="max-w-xl font-serif text-4xl leading-tight md:text-5xl">{brand.matchingLine}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory-dim">
        {brand.circleLine} Hybrid scoring: complementary ask/offer, goals, interests, industry,
        geography, availability, and novelty. Protected traits are not ranking factors.
      </p>

      <div className="mt-10">
        <AskTheMeridian />
      </div>

      <section id="circle" className="mt-12">
        <p className="label">{YOUR_CIRCLE}</p>
        <h2 className="mt-2 font-serif text-3xl">Chosen by you. Not suggested.</h2>
        <p className="mt-2 max-w-xl text-sm text-ivory-muted">
          Add or remove anyone by hand. Hide and block still apply. The Index remains a separate recommendation.
        </p>
        {circleProfiles.length === 0 ? (
          <p className="mt-4 text-sm text-ivory-dim">Your Circle is still. Add someone from a profile or the Index.</p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {circleProfiles.map((p) => (
              <li key={p.id} className="gold-chrome oh-card grid grid-cols-[auto_1fr] gap-4 p-4">
                <Link
                  href={`/member/members/${p.id}`}
                  className="flex h-14 w-14 items-center justify-center font-serif text-xl"
                  style={{ background: p.accent }}
                >
                  {p.initials}
                </Link>
                <div>
                  <Link href={`/member/members/${p.id}`} className="font-serif text-2xl">
                    {p.displayName}
                  </Link>
                  <p className="text-sm text-ivory-muted">
                    {p.headline} · {p.city}
                  </p>
                  <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-gold">{YOUR_CIRCLE}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12">
        <MatchBoard index={index} intros={intros} circleIds={circleIds} />
      </div>
    </MemberShell>
  );
}
