"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProfilePhoto } from "@/lib/data/types";
import { DemoMark } from "@/components/brand/demo-mark";

export function ProfileGallery({
  photos,
  canEdit = false,
}: {
  photos: ProfilePhoto[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function add() {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, kind: "work" }),
    });
    const json = (await res.json()) as { ok?: boolean; note?: string };
    setNote(json.note ?? (json.ok ? "Added to the gallery (Storage stub)." : "Could not add."));
    setCaption("");
    router.refresh();
  }

  if (photos.length === 0 && !canEdit) return null;

  return (
    <section className="mt-10">
      <p className="label">Work / portfolio</p>
      <p className="mt-2 text-sm text-ivory-dim">
        City-level life. No live location. Storage stub + SYNTHETIC DEMO stills.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id} className="panel overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.caption} className="aspect-[4/3] w-full object-cover" />
            <p className="px-3 py-2 text-[11px] text-ivory-muted">{photo.caption}</p>
            {photo.isDemo ? (
              <p className="px-3 pb-3">
                <DemoMark />
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {canEdit ? (
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption for a DEMO still"
            aria-label="Gallery caption"
          />
          <button type="button" className="action-quiet" onClick={() => void add()}>
            Add still
          </button>
        </div>
      ) : null}
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
    </section>
  );
}
