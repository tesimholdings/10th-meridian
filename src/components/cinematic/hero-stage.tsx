"use client";

import { useEffect, useRef, useState } from "react";
import { HarborScene } from "@/components/cinematic/harbor-scene";

export function HeroStage({
  children,
  caption = "REPLACE ASSET — original harbor film: daylight water, yacht deck, night lights. No unlicensed stock.",
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduce(mq.matches);
      if (mq.matches) {
        videoRef.current?.pause();
        setPaused(true);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  function toggle() {
    const el = videoRef.current;
    if (!el) {
      setPaused((p) => !p);
      return;
    }
    if (el.paused) {
      void el.play();
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  }

  return (
    <div className="cinematic relative min-h-dvh overflow-hidden water text-ivory">
      <div className="absolute inset-0 slow-drift opacity-90" aria-hidden>
        <HarborScene className="h-full w-full" />
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.16] contrast-125 saturate-50"
        autoPlay={!reduce}
        muted
        loop
        playsInline
        poster="/media/hero-poster.svg"
        aria-hidden
      />
      <div className="water-shimmer" aria-hidden />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(80% 70% at 50% 38%, rgba(8,9,11,0.02), rgba(8,9,11,0.28) 72%, #08090b 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="grain" />
      <div className="relative z-10">{children}</div>
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-end justify-between gap-3 text-[10px] tracking-[0.18em] uppercase text-ivory-muted/60">
        <p className="max-w-[13rem] leading-relaxed md:max-w-[18rem]">{caption}</p>
        <button
          type="button"
          onClick={toggle}
          className="min-h-11 min-w-11 border border-[rgba(198,164,90,0.45)] px-3 text-[10px] tracking-[0.22em] text-ivory-muted"
        >
          {paused || reduce ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}

