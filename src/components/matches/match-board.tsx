"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MatchIndex } from "@/lib/matching/service";
import type { IntroRequest, ProfileRecord } from "@/lib/data/types";
import { shortMatchReason } from "@/lib/matching/reason";
import { YOUR_CIRCLE } from "@/lib/copy/ui";
import { FoundingBadge } from "@/components/members/founding-badge";
import { OverflowMenu } from "@/components/members/overflow-menu";

export function MatchBoard({
  index,
  intros,
  compact = false,
  circleIds = [],
}: {
  index: MatchIndex;
  intros: IntroRequest[];
  compact?: boolean;
  circleIds?: string[];
}) {
  const rows = compact ? index.meridian10.slice(0, 3) : index.meridian10;
  return (
    <ul className="stagger-in grid gap-4">
      {rows.map((row) => (
        <IndexCard
          key={row.target.id}
          profile={row.target}
          reason={shortMatchReason(row.target, row.explanations)}
          intro={intros.find((x) => x.targetId === row.target.id)}
          inCircle={circleIds.includes(row.target.id)}
        />
      ))}
    </ul>
  );
}

export function IndexCard({
  profile,
  reason,
  intro,
  inCircle,
  className,
}: {
  profile: ProfileRecord;
  reason: string;
  intro?: IntroRequest;
  inCircle?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function message() {
    setPending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profile.id }),
    });
    const json = (await res.json()) as { ok?: boolean; href?: string };
    setPending(false);
    if (json.ok && json.href) {
      router.push(json.href);
      return;
    }
    setNote("That conversation is unavailable. Retry from the profile.");
  }

  async function circle() {
    setPending(true);
    await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: inCircle ? "remove" : "add", targetId: profile.id }),
    });
    setPending(false);
    setNote(inCircle ? "Removed from Your Circle." : "Added to Your Circle.");
    router.refresh();
  }

  async function overflow(action: "intro" | "hide" | "remove-index" | "mute" | "report") {
    setPending(true);
    if (action === "intro") {
      await fetch("/api/introductions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile.id }),
      });
      setNote("Introduction requested.");
    } else if (action === "hide") {
      await fetch("/api/matching/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile.id, signal: "hidden" }),
      });
      setNote("Hidden from this ranking.");
    } else if (action === "mute" || action === "report") {
      const res = await fetch("/api/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId: profile.id }),
      });
      const json = (await res.json()) as { message?: string };
      setNote(json.message ?? (action === "mute" ? "Muted." : "Reported."));
    } else {
      await fetch("/api/circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-index", targetId: profile.id }),
      });
      setNote("Removed from For you recommendations.");
    }
    setPending(false);
    router.refresh();
  }

  return (
    <li className={`lift-card flex gap-3 py-3 ${className ?? ""}`.trim()}>
      <Link
        href={`/member/members/${profile.id}`}
        className="avatar h-14 w-14 text-lg"
        style={{ background: profile.accent }}
      >
        {profile.initials}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/member/members/${profile.id}`} className="font-serif text-2xl">
            {profile.displayName}
          </Link>
          <p className="text-sm text-[var(--ivory-dim)]">{profile.city}</p>
        </div>
        {profile.foundingMember ? (
          <div className="mt-1">
            <FoundingBadge compact />
          </div>
        ) : null}
        <p className="mt-1 text-sm leading-relaxed text-[var(--navy-soft)]">{reason}</p>
        <div className="profile-actions mt-3 justify-start">
          <button type="button" disabled={pending} onClick={() => void message()} className="action-quiet">
            Message
          </button>
          <button
            type="button"
            disabled={pending}
            data-state={inCircle ? "on" : "off"}
            onClick={() => void circle()}
            className="action-quiet"
          >
            {inCircle ? `In ${YOUR_CIRCLE}` : "Circle"}
          </button>
          <OverflowMenu
            disabled={pending}
            items={[
              {
                id: "intro",
                label: intro ? "Introduction requested" : "Request introduction",
                onSelect: () => void overflow("intro"),
              },
              { id: "remove", label: "Remove from For you", onSelect: () => void overflow("remove-index") },
              { id: "hide", label: "Hide", onSelect: () => void overflow("hide") },
              { id: "mute", label: "Mute", onSelect: () => void overflow("mute") },
              { id: "report", label: "Report", onSelect: () => void overflow("report") },
              { id: "help", label: "Help", href: "/member/help" },
            ]}
          />
        </div>
        {note ? <p className="action-ack mt-2 text-xs text-[var(--gold-dim)]">{note}</p> : null}
      </div>
    </li>
  );
}
