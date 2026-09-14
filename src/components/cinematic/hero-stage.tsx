"use client";

import { useEffect, useRef, useState } from "react";

export function HeroStage({
  children,
  caption = "REPLACE ASSET — harbor-water hero. Portrait on phone, widescreen on desktop. Compress and lazy-load the final film.",
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
      <div className="absolute inset-0 slow-drift opacity-80" aria-hidden>
        <CelestialField />
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.22] contrast-125 saturate-50"
        autoPlay={!reduce}
        muted
        loop
        playsInline
        poster="/media/hero-poster.svg"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(80% 70% at 50% 38%, rgba(8,9,11,0.04), rgba(8,9,11,0.38) 72%, #08090b 100%)",
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
          className="min-h-11 min-w-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.22em] text-ivory-muted"
        >
          {paused || reduce ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}

function CelestialField() {
  return (
    <svg viewBox="0 0 1200 1800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#2d96b8" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#0f4d6b" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#08090b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="1800" fill="url(#glow)" />
      {Array.from({ length: 42 }).map((_, i) => {
        const x = (i * 97) % 1200;
        const y = (i * 173 + 80) % 1600;
        return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 1.4 : 0.7} fill="#f6f4ef" opacity={0.38} />;
      })}
      <path d="M600 40 V1760" stroke="#c6a45a" strokeWidth="0.7" opacity="0.5" />
      <path d="M80 900 H1120" stroke="#7ec8de" strokeWidth="0.4" opacity="0.22" />
      <ellipse cx="600" cy="900" rx="420" ry="160" fill="none" stroke="#f6f4ef" opacity="0.14" />
      <ellipse cx="600" cy="900" rx="160" ry="420" fill="none" stroke="#7ec8de" opacity="0.14" />
      <path d="M40 1500 C 260 1380, 480 1620, 720 1480 S 1080 1400, 1180 1520" fill="none" stroke="#2d96b8" strokeWidth="18" opacity="0.4" />
    </svg>
  );
}
