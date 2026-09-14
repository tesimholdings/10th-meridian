"use client";

import { useRouter } from "next/navigation";
import type { JourneyRecord } from "@/lib/crossings/types";

export function JourneyControls({ journey }: { journey: JourneyRecord }) {
  const router = useRouter();

  async function act(action: "pause" | "resume" | "delete") {
    await fetch("/api/crossings/journeys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: journey.id, action }),
    });
    router.push("/member/crossings");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {journey.status === "paused" ? (
        <button
          type="button"
          className="action-quiet"
          onClick={() => void act("resume")}
        >
          Resume
        </button>
      ) : (
        <button
          type="button"
          className="action-quiet"
          onClick={() => void act("pause")}
        >
          Pause
        </button>
      )}
      <button
        type="button"
        className="action-quiet"
        onClick={() => void act("delete")}
      >
        Delete
      </button>
    </div>
  );
}
