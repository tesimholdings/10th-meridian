"use client";

import { useMemo, useState } from "react";
import type { IntroRequest, ProfileRecord } from "@/lib/data/types";
import { IndexCard } from "@/components/matches/match-board";
import { Chip } from "@/components/ui/chip";
import { shortMatchReason } from "@/lib/matching/reason";
import { EmptyState } from "@/components/crossings/states";

export function AllMembersBoard({
  profiles,
  intros,
  circleIds,
  query = "",
}: {
  profiles: ProfileRecord[];
  intros: IntroRequest[];
  circleIds: string[];
  query?: string;
}) {
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const cities = useMemo(
    () => [...new Set(profiles.map((p) => p.city).filter(Boolean))].sort(),
    [profiles],
  );
  const industries = useMemo(
    () => [...new Set(profiles.flatMap((p) => p.industries).filter(Boolean))].sort().slice(0, 8),
    [profiles],
  );

  const filtered = useMemo(() => {
    const hay = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (city && p.city !== city) return false;
      if (industry && !p.industries.includes(industry)) return false;
      if (!hay) return true;
      const blob = [p.displayName, p.headline, p.city, p.country, p.offers.join(" "), p.needs.join(" "), p.industries.join(" ")]
        .join(" ")
        .toLowerCase();
      return blob.includes(hay);
    });
  }, [profiles, city, industry, query]);

  const filterLabel = [city, industry].filter(Boolean).join(" · ");

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Chip on={!city} onClick={() => setCity("")}>
          All cities
        </Chip>
        {cities.map((c) => (
          <Chip key={c} on={city === c} onClick={() => setCity(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Chip on={!industry} onClick={() => setIndustry("")}>
          All industries
        </Chip>
        {industries.map((item) => (
          <Chip key={item} on={industry === item} onClick={() => setIndustry(item)}>
            {item}
          </Chip>
        ))}
      </div>
      {city || industry ? (
        <button type="button" className="mt-3 min-h-11 text-sm text-[var(--blue)]" onClick={() => {
          setCity("");
          setIndustry("");
        }}>
          Clear filters
        </button>
      ) : null}

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={filterLabel ? `No members in ${filterLabel}.` : query ? `No people matching “${query}”.` : "No one in this frame."}
            body="Filters stay on this device. Widen the search — the house does not invent members."
          />
        </div>
      ) : (
        <ul className="stagger-in mt-6 grid gap-4">
          {filtered.map((p) => (
            <IndexCard
              key={p.id}
              profile={p}
              reason={shortMatchReason(p)}
              intro={intros.find((i) => i.targetId === p.id)}
              inCircle={circleIds.includes(p.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
