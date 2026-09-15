"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RewardGlyph } from "@/components/rewards/glyphs";
import { ProgressRing } from "@/components/rewards/progress-ring";
import { RewardsSheet } from "@/components/rewards/sheet";
import { postRewards } from "@/lib/rewards/http";
import { formatPoints, formatUsd } from "@/lib/rewards/math";
import type { RewardCardView } from "@/lib/rewards/types";

const stateLabel: Record<RewardCardView["state"], string> = {
  locked: "Locked",
  in_progress: "In progress",
  ready: "Ready",
  redeemed: "Redeemed",
};

export function RewardCard({ card }: { card: RewardCardView }) {
  const router = useRouter();
  const [open, setOpen] = useState<"reserve" | "redeem" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(body: Record<string, unknown>) {
    setBusy(true);
    const json = await postRewards(body);
    setBusy(false);
    if (!json.ok) {
      setStatus(json.message ?? "Could not complete that.");
      return false;
    }
    setOpen(null);
    setStatus(null);
    router.refresh();
    return true;
  }

  return (
    <article
      className={`reward-card rounded-3xl bg-white p-5 ${card.state === "ready" ? "reward-unlock" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <RewardGlyph kind={card.item.kind} />
          <h3 className="mt-3 font-serif text-2xl">{card.item.title}</h3>
          <p className="mt-1 text-sm text-[var(--ivory-dim)]">{card.item.short}</p>
        </div>
        <div className="text-right">
          <ProgressRing
            value={card.progressUsd}
            max={card.costUsd}
            label={card.progressLabel}
          />
          <p className="mt-1 text-xs text-[var(--ivory-dim)]">{card.progressLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="pill">{stateLabel[card.state]}</span>
        <span className="text-sm text-[var(--navy-soft)]">
          {formatPoints(card.costPoints)} · {formatUsd(card.costUsd)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--navy-soft)]">{card.item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {card.canReserve ? (
          <Button type="button" variant="ghost" className="house-light-btn" onClick={() => setOpen("reserve")}>
            Reserve
          </Button>
        ) : null}
        {card.canCancelReserve && card.reservation ? (
          <Button
            type="button"
            variant="ghost"
            className="house-light-btn"
            disabled={busy}
            onClick={() => void run({ action: "cancel-reserve", id: card.reservation!.id })}
          >
            Cancel reserve
          </Button>
        ) : null}
        {card.canRedeem ? (
          <Button type="button" onClick={() => setOpen("redeem")}>
            {card.item.reservable ? "Unlock" : card.item.kind === "trip" ? "Request" : "Unlock"}
          </Button>
        ) : null}
        {!card.canRedeem && !card.canReserve && card.state === "locked" ? (
          <span className="text-sm text-[var(--ivory-dim)]">
            {card.item.unlockCreditsRequired > 1
              ? `Unlock at ${card.item.unlockCreditsRequired} referrals`
              : "Earn to unlock"}
          </span>
        ) : null}
        {card.redemption ? (
          <span className="text-sm text-[var(--gold-dim)]">
            {card.redemption.status.replaceAll("_", " ")}
          </span>
        ) : null}
      </div>

      {status ? <p className="mt-3 text-sm text-[var(--danger)]">{status}</p> : null}

      <RewardsSheet open={open === "reserve"} title="Reserve gold" onClose={() => setOpen(null)}>
        <p className="text-sm leading-relaxed text-[var(--navy-soft)]">
          Reserved credit locks to this reward until it is funded or you cancel. You can reserve before
          the balance is full. Ops fulfills offline — this is not instantaneous shipping of real gold.
        </p>
        <div className="mt-5">
          <Button type="button" disabled={busy} onClick={() => void run({ action: "reserve", rewardId: card.item.id })}>
            Reserve
          </Button>
        </div>
      </RewardsSheet>

      <RewardsSheet
        open={open === "redeem"}
        title={card.item.kind === "trip" ? "Request trip credit" : `Unlock ${card.item.title}`}
        onClose={() => setOpen(null)}
      >
        <RedeemForm card={card} busy={busy} onSubmit={(payload) => void run(payload)} />
      </RewardsSheet>
    </article>
  );
}

function RedeemForm({
  card,
  busy,
  onSubmit,
}: {
  card: RewardCardView;
  busy: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestName, setGuestName] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          action: "redeem",
          rewardId: card.item.id,
          destination,
          startDate,
          endDate,
          guestName,
          shippingName,
          shippingCity,
          shippingRegion,
          shippingCountry,
        });
      }}
    >
      <p className="text-sm leading-relaxed text-[var(--navy-soft)]">
        Editorial fulfillment. The house completes this offline. This is not a live booking, shipment, or
        brokerage.
      </p>
      {card.item.kind === "trip" ? (
        <>
          <label className="grid gap-1">
            <span className="label">Destination</span>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="label">Start</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="label">End</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </>
      ) : null}
      {card.item.kind === "gold" ? (
        <>
          <label className="grid gap-1">
            <span className="label">Ship to</span>
            <input value={shippingName} onChange={(e) => setShippingName(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="label">City</span>
            <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="label">Region</span>
            <input value={shippingRegion} onChange={(e) => setShippingRegion(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="label">Country</span>
            <input value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} required />
          </label>
        </>
      ) : null}
      {card.item.kind === "guest_pass" ? (
        <label className="grid gap-1">
          <span className="label">Guest name</span>
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
        </label>
      ) : null}
      <Button type="submit" disabled={busy}>
        {card.item.kind === "trip" ? "Request stipend" : "Confirm"}
      </Button>
    </form>
  );
}
