"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OverflowMenu } from "@/components/members/overflow-menu";

export function ProfileActions({
  targetId,
  introStatus,
  inCircle,
  removedFromIndex,
  compact = false,
}: {
  targetId: string;
  introStatus?: string;
  inCircle?: boolean;
  removedFromIndex?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function introduce() {
    setPending(true);
    const res = await fetch("/api/introductions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setNote(json.ok ? "Introduction requested." : "Could not request that introduction.");
    setPending(false);
    router.refresh();
  }

  async function message() {
    setPending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    const json = (await res.json()) as { ok?: boolean; href?: string };
    setPending(false);
    if (json.ok && json.href) {
      router.push(json.href);
      return;
    }
    setNote("That conversation is unavailable. Retry.");
  }

  async function safety(action: "report" | "mute") {
    setPending(true);
    const res = await fetch("/api/safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string };
    setPending(false);
    setNote(json.message ?? (json.ok ? "Noted." : "Could not complete that."));
    router.refresh();
  }

  async function circle(action: "add" | "remove" | "remove-index") {
    setPending(true);
    const res = await fetch("/api/circle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    const json = (await res.json()) as { ok?: boolean };
    setPending(false);
    setNote(
      json.ok
        ? action === "add"
          ? "Added to Your Circle."
          : action === "remove"
            ? "Removed from Your Circle."
            : "Removed from For you recommendations."
        : "Could not update the network.",
    );
    router.refresh();
  }

  return (
    <div className={compact ? "profile-actions-wrap" : "profile-actions-wrap mt-5"}>
      <div className="profile-actions">
        <button type="button" disabled={pending} onClick={() => void message()} className="action-quiet">
          Message
        </button>
        <button
          type="button"
          disabled={pending}
          data-state={inCircle ? "on" : "off"}
          onClick={() => void circle(inCircle ? "remove" : "add")}
          className="action-quiet"
        >
          {inCircle ? "In Circle" : "Circle"}
        </button>
        <OverflowMenu
          disabled={pending}
          items={[
            {
              id: "intro",
              label: introStatus ? `Intro ${introStatus}` : "Request introduction",
              onSelect: () => void introduce(),
              disabled: pending,
            },
            ...(removedFromIndex
              ? []
              : [
                  {
                    id: "remove-index",
                    label: "Remove from For you",
                    onSelect: () => void circle("remove-index"),
                    disabled: pending,
                  },
                ]),
            { id: "mute", label: "Mute", onSelect: () => void safety("mute"), disabled: pending },
            { id: "report", label: "Report", onSelect: () => void safety("report"), disabled: pending },
            { id: "help", label: "Help", href: "/member/help" },
          ]}
        />
      </div>
      {note ? <p className="action-ack mt-3 text-center text-sm text-[var(--gold-dim)]">{note}</p> : null}
    </div>
  );
}
