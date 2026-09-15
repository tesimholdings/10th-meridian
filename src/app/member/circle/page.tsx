import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { IndexCard } from "@/components/matches/match-board";
import { ForYouField } from "@/components/circle/for-you-field";
import { AskTheMeridian } from "@/components/index/ask-meridian";
import { viewerProfile, getPreviewStore } from "@/lib/preview/store";
import { demoIndexFor } from "@/lib/matching/service";
import {
  INDEX_TAB_ALL,
  INDEX_TAB_CIRCLE,
  INDEX_TAB_FOR_YOU,
  MERIDIAN_INDEX,
  YOUR_CIRCLE,
} from "@/lib/copy/ui";
import { circleIdsFor } from "@/lib/network/circle";
import { shortMatchReason } from "@/lib/matching/reason";
import Link from "next/link";

export const metadata = { title: MERIDIAN_INDEX, robots: { index: false } };

export default async function MyCirclePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const access = await resolveAccessContext();
  const viewer = viewerProfile();
  const store = getPreviewStore();
  const params = await searchParams;
  const tab = params.tab === "circle" || params.tab === "all" ? params.tab : "for-you";
  const q = (params.q ?? "").trim().toLowerCase();
  const index = await demoIndexFor(viewer);
  const intros = store.intros;
  const circleIds = circleIdsFor(viewer.id, store.circle);
  const circleProfiles = store.profiles.filter((p) => circleIds.includes(p.id));

  const all = store.profiles.filter((p) => p.id !== viewer.id);
  const searched = q
    ? all.filter((p) =>
        [p.displayName, p.headline, p.city, p.country, p.offers.join(" "), p.needs.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : all;

  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess || viewer.isDemo} title={MERIDIAN_INDEX}>
      <AskTheMeridian initialQuery={q} />

      <nav className="mt-8 flex gap-2 border-b border-[var(--line)]" aria-label="My Circle sections">
        <Tab href="/member/circle" on={tab === "for-you"}>
          {INDEX_TAB_FOR_YOU}
        </Tab>
        <Tab href="/member/circle?tab=circle" on={tab === "circle"}>
          {INDEX_TAB_CIRCLE}
        </Tab>
        <Tab href="/member/circle?tab=all" on={tab === "all"}>
          {INDEX_TAB_ALL}
        </Tab>
      </nav>

      <div className="mt-6">
        {tab === "for-you" ? (
          <ForYouField rows={index.meridian100} intros={intros} circleIds={circleIds} />
        ) : null}

        {tab === "circle" ? (
          circleProfiles.length === 0 ? (
            <p className="text-sm text-[var(--ivory-dim)]">
              {YOUR_CIRCLE} is empty. Add someone from a profile.
            </p>
          ) : (
            <ul className="stagger-in grid gap-4">
              {circleProfiles.map((p) => (
                <IndexCard
                  key={p.id}
                  profile={p}
                  reason={`${YOUR_CIRCLE} · ${p.city}`}
                  intro={intros.find((i) => i.targetId === p.id)}
                  inCircle
                />
              ))}
            </ul>
          )
        ) : null}

        {tab === "all" ? (
          searched.length === 0 ? (
            <p className="text-sm text-[var(--ivory-dim)]">No one in this frame.</p>
          ) : (
            <ul className="stagger-in grid gap-4">
              {searched.map((p) => (
                <IndexCard
                  key={p.id}
                  profile={p}
                  reason={shortMatchReason(p)}
                  intro={intros.find((i) => i.targetId === p.id)}
                  inCircle={circleIds.includes(p.id)}
                />
              ))}
            </ul>
          )
        ) : null}
      </div>
    </MemberShell>
  );
}

function Tab({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`tab-slide min-h-11 flex-1 text-center text-sm ${
        on ? "border-b-2 border-[var(--gold)] text-[var(--navy)]" : "text-[var(--ivory-dim)]"
      }`}
    >
      {children}
    </Link>
  );
}
