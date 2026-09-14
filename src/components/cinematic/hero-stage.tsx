"use client";

import { useEffect, useRef, useState } from "react";

export function HeroStage({
  children,
  caption = "Original daylight water still — Higgsfield film later.",
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!video || reduce) return;
        if (entry.isIntersecting && !paused) void video.play();
        else video.pause();
      },
      { threshold: 0.2 },
    );
    if (video) io.observe(video);
    return () => io.disconnect();
  }, [paused, reduce]);

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
      <div className="absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/scene-water.svg"
          alt=""
          className={`h-full w-full object-cover object-center opacity-90 ${reduce || paused ? "" : "slow-drift"}`}
        />
      </div>
      <div className="absolute inset-0 opacity-55" aria-hidden>
        <WaterField />
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.28] contrast-125 saturate-[1.15]"
        autoPlay={!reduce}
        muted
        loop
        playsInline
        poster="/media/hero-poster.svg"
        aria-hidden
      />
      {reduce || paused ? null : (
        <div className="wave-shimmer pointer-events-none absolute inset-0" aria-hidden />
      )}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(80% 70% at 50% 32%, rgba(9,43,69,0.04), rgba(9,43,69,0.22) 72%, rgba(9,43,69,0.55) 100%)",
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
          className="min-h-11 min-w-11 border border-[rgba(212,175,106,0.4)] bg-[rgba(7,8,9,0.45)] px-3 text-[10px] tracking-[0.22em] text-ivory-muted"
        >
          {paused || reduce ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}

function WaterField() {
  return (
    <svg viewBox="0 0 1200 1800" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#7ec8e3" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#1a6b8a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#070809" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="1800" fill="url(#glow)" />
      {Array.from({ length: 36 }).map((_, i) => {
        const x = (i * 97) % 1200;
        const y = (i * 173 + 80) % 1600;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 7 === 0 ? 1.6 : 0.7}
            fill={i % 5 === 0 ? "#d4af6a" : "#efe6d4"}
            opacity={0.38}
          />
        );
      })}
      <path d="M600 40 V1760" stroke="#d4af6a" strokeWidth="0.8" opacity="0.5" />
      <path d="M80 900 H1120" stroke="#efe6d4" strokeWidth="0.4" opacity="0.18" />
      <ellipse cx="600" cy="1240" rx="460" ry="90" fill="#7ec8e3" opacity="0.06" />
      <path
        d="M40 1500 C 260 1380, 480 1620, 720 1480 S 1080 1400, 1180 1520"
        fill="none"
        stroke="#1a6b8a"
        strokeWidth="22"
        opacity="0.4"
      />
    </svg>
  );
}
