import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { StewardNote } from "@/components/member/steward-note";
import { SOLICITING_BAN } from "@/lib/copy/community";
import { greetingName } from "@/lib/member/identity";

export const metadata = { title: "Help", robots: { index: false } };

export default async function HelpPage() {
  const access = await resolveAccessContext();
  const name = greetingName(access.user, "Member");
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Help" hasHeading>
      <p className="member-kicker">House</p>
      <h1 className="member-title">Help</h1>
      <p className="member-support">
        A steward reads member notes. This is not an instant chat.
      </p>
      <StewardNote fromName={name} />
      <ul className="mt-8 grid gap-4">
        <li className="member-card px-5 py-5">
          <h2 className="font-serif text-2xl">Report soliciting</h2>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">{SOLICITING_BAN}</p>
          <p className="mt-2 text-sm text-[var(--ivory-dim)]">
            Use Report on a member profile or in a conversation.
          </p>
        </li>
        <li className="member-card px-5 py-5">
          <h2 className="font-serif text-2xl">Mute recommendations</h2>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">
            Mute on a profile removes that person from For you. It does not delete messages already sent.
          </p>
        </li>
      </ul>
    </MemberShell>
  );
}
