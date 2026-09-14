import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MeridianLists } from "@/components/matches/meridian-lists";
import { demoAnnouncements, demoEvents, viewerDemoProfile } from "@/lib/data/demo";
import { demoIndexFor } from "@/lib/matching/service";

export const metadata = { title: "DEMO Home", robots: { index: false } };

export default async function DemoHomePage() {
  const access = await resolveAccessContext();
  const index = await demoIndexFor(viewerDemoProfile);
  return (
    <MemberShell user={access.user} demo title="DEMO · Home">
      <h1 className="font-serif text-4xl">A house made of samples</h1>
      <p className="mt-3 text-ivory-muted">
        Guest Open House access. Real DMs, payments, and admin records are not here.
      </p>
      {demoAnnouncements.map((a) => (
        <p key={a.id} className="mt-6 text-sm text-ivory-muted">
          {a.body}
        </p>
      ))}
      <div className="mt-10">
        <MeridianLists index={index} compact />
      </div>
      <ul className="mt-10 text-sm text-ivory-dim">
        {demoEvents.map((e) => (
          <li key={e.id}>{e.title}</li>
        ))}
      </ul>
    </MemberShell>
  );
}
