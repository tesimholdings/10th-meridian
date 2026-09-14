import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { AskPanel } from "@/components/ask/ask-panel";
import { ASK_COPY } from "@/lib/matching/ask/types";
import { demoAskIndexFor } from "@/lib/matching/ask/service";
import { getPreviewStore, lastHelpAsk, viewerProfile } from "@/lib/preview/store";

export const metadata = { title: "Ask the Meridian", robots: { index: false } };

export default async function AskPage() {
  const access = await resolveAccessContext();
  const viewer = viewerProfile();
  const store = getPreviewStore();
  const last = lastHelpAsk(viewer.id);
  const initial = last
    ? await demoAskIndexFor({
        viewer,
        query: last.query,
        intents: last.intents,
        filters: last.filters,
        askId: last.id,
        isMemberAccess: access.decision.isMemberAccess,
      })
    : null;

  return (
    <MemberShell
      user={access.user}
      demo={!access.decision.isMemberAccess || viewer.isDemo}
      title={ASK_COPY.subtitle}
    >
      <AskPanel
        intros={store.intros}
        initial={initial}
        variant="page"
        openHouseIsolation={!access.decision.isMemberAccess}
      />
    </MemberShell>
  );
}
