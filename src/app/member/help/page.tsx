import Link from "next/link";
import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { SOLICITING_BAN } from "@/lib/copy/community";

export const metadata = { title: "Help", robots: { index: false } };

export default async function HelpPage() {
  const access = await resolveAccessContext();
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Help" hasHeading>
      <h1 className="font-serif text-4xl">Help</h1>
      <p className="mt-4 max-w-xl text-[var(--navy-soft)]">
        A steward reads member reports. This is not an instant chat. During preview, notes stay in this
        environment and are not a live operations queue.
      </p>
      <ul className="mt-8 grid gap-4">
        <li className="surface rounded-3xl p-5">
          <h2 className="font-serif text-2xl">Report soliciting</h2>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">{SOLICITING_BAN}</p>
          <p className="mt-2 text-sm text-[var(--ivory-dim)]">
            Use Report on a member profile or in a conversation. Ban with no refund is a house rule, not a
            button you press yourself.
          </p>
        </li>
        <li className="surface rounded-3xl p-5">
          <h2 className="font-serif text-2xl">Mute recommendations</h2>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">
            Mute on a profile removes that person from For you. It does not delete messages already sent.
          </p>
        </li>
        <li className="surface rounded-3xl p-5">
          <h2 className="font-serif text-2xl">Contact a steward</h2>
          <p className="mt-2 text-sm text-[var(--navy-soft)]">
            Write from Account settings or this page. Expect a human reply during Open House hours, not a
            same-minute auto-response.
          </p>
          <Link href="/member/settings" className="mt-3 inline-flex min-h-11 items-center text-sm text-[var(--blue)]">
            Account settings
          </Link>
        </li>
      </ul>
    </MemberShell>
  );
}
