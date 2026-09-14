import type { MatchIndex } from "@/lib/matching/service";
import { brand } from "@/lib/config/site";
import { WhyMeet } from "@/components/ui/why-meet";
import { DemoMark } from "@/components/brand/demo-mark";

export function MeridianLists({ index, compact = false }: { index: MatchIndex; compact?: boolean }) {
  const ten = index.meridian10;
  const rest = compact ? [] : index.meridian100.slice(10);

  return (
    <div className="grid gap-10">
      <section>
        <p className="label">The Meridian 10</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl">{brand.meridian10}</h2>
        <ol className="mt-6 grid gap-4">
          {ten.map((row, i) => (
            <li key={row.target.id} className="panel grid grid-cols-[auto_1fr] gap-4 p-4">
              <div
                className="flex h-16 w-16 items-center justify-center font-serif text-xl"
                style={{ background: row.target.accent }}
              >
                {row.target.initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-serif text-2xl">{row.target.displayName}</p>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-gold">
                    {String(i + 1).padStart(2, "0")} · {Math.round(row.weighted * 100)}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-ivory-muted">{row.target.headline}</p>
                <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-ivory-dim">
                  {row.source === "human_curated" ? "Human-curated" : "Algorithmic signal"}
                </p>
                {row.target.isDemo ? (
                  <p className="mt-2">
                    <DemoMark />
                  </p>
                ) : null}
                <WhyMeet items={row.explanations} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {compact ? null : (
        <section>
          <p className="label">The Meridian 100</p>
          <h2 className="mt-2 font-serif text-3xl">{brand.meridian100}</h2>
          <p className="mt-2 text-sm text-ivory-dim">
            {index.meridian100.length} eligible connections. Never invented.
          </p>
          <ol className="mt-6 grid gap-0">
            {rest.map((row, i) => (
              <li key={row.target.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-4">
                <div className="min-w-0">
                  <p className="font-serif text-xl">{row.target.displayName}</p>
                  <p className="text-sm text-ivory-muted">{row.target.headline}</p>
                </div>
                <p className="shrink-0 text-[11px] tracking-[0.16em] uppercase text-gold">
                  {String(i + 11).padStart(2, "0")}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
