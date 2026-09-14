import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { MeridianLists } from "@/components/matches/meridian-lists";
import { demoAnnouncements, demoEvents, demoIntros, viewerDemoProfile } from "@/lib/data/demo";
import { demoIndexFor } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Home", robots: { index: false } };

export default async function MemberHomePage() {
  const access = await resolveAccessContext();
  const index = await demoIndexFor(viewerDemoProfile);
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Good evening">
      <h1 className="font-serif text-4xl md:text-5xl">
        {access.user?.name ?? "Member"}, the house is still.
      </h1>
      <p className="mt-3 max-w-xl text-ivory-muted">{brand.matchingLine}</p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Stat label="Unread / mentions" value="3 · DEMO" />
        <Stat label="Profile completion" value={`${viewerDemoProfile.completion}%`} />
        <Stat label="Membership" value="Active · renewal unset" />
      </section>

      <section className="mt-12">
        <p className="label">Announcements</p>
        {demoAnnouncements.map((a) => (
          <article key={a.id} className="mt-3 border border-[var(--line)] p-4">
            <h2 className="font-serif text-2xl">{a.title}</h2>
            <p className="mt-2 text-sm text-ivory-muted">{a.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <MeridianLists index={index} compact />
      </section>

      <section className="mt-12">
        <p className="label">Upcoming experiences</p>
        <ul className="mt-4 grid gap-3">
          {demoEvents.map((e) => (
            <li key={e.id} className="border-b border-[var(--line)] py-3">
              <p className="font-serif text-xl">{e.title}</p>
              <p className="text-sm text-ivory-muted">{e.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <p className="label">Introduction requests</p>
        {demoIntros.map((i) => (
          <p key={i.id} className="mt-2 text-sm text-ivory-muted">
            {i.fromName} → {i.toName} · {i.status} · DEMO
          </p>
        ))}
      </section>
    </MemberShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line)] p-4">
      <p className="label">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
