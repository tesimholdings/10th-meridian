"use client";

import { useEffect, useRef, useState } from "react";

export function HeroStage({
  children,
  caption = "REPLACE ASSET — cinematic night-water hero. Portrait on phone, widescreen on desktop. Compress and lazy-load the final film.",
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
    <div className="relative min-h-dvh overflow-hidden water text-ivory">
      <div className="absolute inset-0 slow-drift opacity-80" aria-hidden>
        <CelestialField />
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        autoPlay={!reduce}
        muted
        loop
        playsInline
        poster="/media/hero-poster.svg"
        aria-hidden
      />
      <div className="grain" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-void" />
      <div className="relative z-10">{children}</div>
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-end justify-between gap-3 text-[10px] tracking-[0.18em] uppercase text-ivory-muted/70">
        <p className="max-w-[16rem] leading-relaxed">{caption}</p>
        <button
          type="button"
          onClick={toggle}
          className="min-h-11 min-w-11 border border-[var(--line)] px-3 text-[10px] tracking-[0.22em]"
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
          <stop offset="0%" stopColor="#14343c" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#0c1c28" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#070809" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="1800" fill="url(#glow)" />
      {Array.from({ length: 42 }).map((_, i) => {
        const x = (i * 97) % 1200;
        const y = (i * 173 + 80) % 1600;
        return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 1.4 : 0.7} fill="#efe6d4" opacity={0.35} />;
      })}
      <path d="M600 40 V1760" stroke="#b08d4a" strokeWidth="0.7" opacity="0.45" />
      <path d="M80 900 H1120" stroke="#efe6d4" strokeWidth="0.4" opacity="0.18" />
      <ellipse cx="600" cy="900" rx="420" ry="160" fill="none" stroke="#efe6d4" opacity="0.12" />
      <ellipse cx="600" cy="900" rx="160" ry="420" fill="none" stroke="#efe6d4" opacity="0.1" />
      <path d="M40 1500 C 260 1380, 480 1620, 720 1480 S 1080 1400, 1180 1520" fill="none" stroke="#14343c" strokeWidth="18" opacity="0.35" />
    </svg>
  );
}
