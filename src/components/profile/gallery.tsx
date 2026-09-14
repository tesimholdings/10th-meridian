"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ProfilePhoto } from "@/lib/data/types";

export function ProfileGallery({
  photos,
  canEdit = false,
}: {
  photos: ProfilePhoto[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const scroller = useRef<HTMLUListElement>(null);
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function add() {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, kind: "work" }),
    });
    const json = (await res.json()) as { ok?: boolean; note?: string };
    setNote(json.note ?? (json.ok ? "Added to the gallery." : "Could not add."));
    setCaption("");
    router.refresh();
  }

  if (photos.length === 0 && !canEdit) return null;

  return (
    <section className="mt-6">
      <ul
        ref={scroller}
        className="hide-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto"
        aria-label="Gallery"
      >
        {photos.map((photo) => (
          <li key={photo.id} className="media-slot w-[82%] shrink-0 snap-center overflow-hidden rounded-3xl" data-higgsfield="pending">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.caption} className="aspect-[4/3] w-full object-cover" />
            <p className="mt-2 text-sm text-[var(--ivory-dim)]">{photo.caption}</p>
          </li>
        ))}
      </ul>
      {canEdit ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
            aria-label="Gallery caption"
          />
          <button type="button" className="action-quiet" onClick={() => void add()}>
            Add still
          </button>
        </div>
      ) : null}
      {note ? <p className="mt-2 text-sm text-[var(--gold)]">{note}</p> : null}
    </section>
  );
}
