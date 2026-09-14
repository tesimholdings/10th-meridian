import { resolveAccessContext } from "@/lib/access/context";
import { MemberShell } from "@/components/member/member-shell";
import { viewerDemoProfile } from "@/lib/data/demo";

export const metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const access = await resolveAccessContext();
  const p = viewerDemoProfile;
  return (
    <MemberShell user={access.user} demo={!access.decision.isMemberAccess} title="Profile">
      <div className="h-1 bg-[var(--line)]">
        <div className="h-1 bg-[var(--gold)]" style={{ width: `${p.completion}%` }} />
      </div>
      <p className="mt-2 text-[11px] tracking-[0.18em] uppercase text-gold">
        Completion {p.completion}% · matching sharpens as this fills
      </p>
      <h1 className="mt-6 font-serif text-4xl">{p.displayName}</h1>
      <p className="mt-2 text-ivory-muted">{p.headline}</p>
      <dl className="mt-8 grid gap-5">
        <Item label="Role" value={p.roleTitle} />
        <Item label="City" value={`${p.city}, ${p.country}`} />
        <Item label="Offers" value={p.offers.join(" · ")} />
        <Item label="Needs" value={p.needs.join(" · ")} />
        <Item label="Goals" value={p.goals.join(" · ")} />
        <Item label="Availability" value={p.availability} />
      </dl>
      <p className="mt-8 text-sm text-ivory-dim">
        Onboarding after approval and payment collects the structured fields used
        by The Meridian Index. This preview shows a completed DEMO profile.
      </p>
    </MemberShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
