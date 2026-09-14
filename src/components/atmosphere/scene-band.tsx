import type { ReactNode } from "react";

export type SceneKind = "water" | "yacht" | "concert";

const SCENES: Record<SceneKind, { src: string; label: string }> = {
  water: {
    src: "/media/scene-water.svg",
    label: "Clear water — original House still",
  },
  yacht: {
    src: "/media/scene-yacht.svg",
    label: "Deck meeting — original House still",
  },
  concert: {
    src: "/media/scene-concert.svg",
    label: "Night gathering — original House still",
  },
};

const HEIGHTS = {
  sm: "min-h-[140px]",
  md: "min-h-[220px] md:min-h-[280px]",
  lg: "min-h-[320px] md:min-h-[420px]",
} as const;

export function SceneBand({
  scene,
  className = "",
  children,
  height = "md",
  overlay = true,
}: {
  scene: SceneKind;
  className?: string;
  children?: ReactNode;
  height?: "sm" | "md" | "lg";
  overlay?: boolean;
}) {
  const meta = SCENES[scene];
  return (
    <div className={`scene-band relative overflow-hidden ${HEIGHTS[height]} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.src}
        alt={meta.label}
        className="scene-band-art absolute inset-0 h-full w-full object-cover"
      />
      {overlay ? (
        <div className="scene-band-veil pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
      <div className="scene-band-shine pointer-events-none absolute inset-0" aria-hidden />
      {children ? (
        <div className={`relative z-[2] flex items-end p-6 md:p-10 ${HEIGHTS[height]}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function SceneChip({ scene }: { scene: SceneKind }) {
  const label =
    scene === "water" ? "Clear water" : scene === "yacht" ? "Deck meeting" : "Night gathering";
  return (
    <span className="scene-chip inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,106,0.35)] bg-[rgba(8,10,14,0.55)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
      <span className="scene-chip-dot h-1.5 w-1.5 rounded-full bg-[var(--aqua)]" aria-hidden />
      {label}
    </span>
  );
}
