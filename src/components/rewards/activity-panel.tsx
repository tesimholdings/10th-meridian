"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postRewards } from "@/lib/rewards/http";
import { catalogById } from "@/lib/rewards/catalog";
import { formatUsd } from "@/lib/rewards/math";
import type { RewardsSnapshot } from "@/lib/rewards/types";

export function ActivityPanel({ snapshot }: { snapshot: RewardsSnapshot }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="font-serif text-2xl">Credit ledger</h2>
        {snapshot.ledger.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ivory-dim)]">No movements yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {snapshot.ledger.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm">{row.memo}</p>
                  <p className="mt-1 text-xs text-[var(--ivory-dim)]">
                    {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <p className={`text-sm font-medium ${row.amountUsd < 0 ? "text-[var(--ivory-dim)]" : "text-[var(--navy)]"}`}>
                  {row.amountUsd > 0 ? "+" : ""}
                  {formatUsd(row.amountUsd)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl">Redemptions</h2>
        {snapshot.redemptions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ivory-dim)]">None requested.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {snapshot.redemptions.map((row) => {
              const item = catalogById(row.rewardId);
              return (
                <li key={row.id} className="rounded-3xl bg-white p-4">
                  <p className="font-medium">{item?.title ?? row.rewardId}</p>
                  <p className="mt-1 text-sm text-[var(--ivory-dim)]">
                    {formatUsd(row.amountUsd)} · {row.status.replaceAll("_", " ")}
                  </p>
                  {row.destination ? (
                    <p className="mt-1 text-sm text-[var(--navy-soft)]">
                      {row.destination}
                      {row.startDate ? ` · ${row.startDate}–${row.endDate}` : ""}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--ivory-dim)]">{row.editorialNote}</p>
                  {row.status === "requested" || row.status === "approved" ? (
                    <button
                      type="button"
                      className="action-quiet mt-3"
                      disabled={busy === row.id}
                      onClick={async () => {
                        setBusy(row.id);
                        await postRewards({ action: "advance-redemption", id: row.id });
                        setBusy(null);
                        router.refresh();
                      }}
                    >
                      Preview: {row.status === "requested" ? "approve" : "mark paid"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
