"use client";

import { useEffect, useRef, useState } from "react";
import { pauseSafe, playSafe } from "@/lib/atmosphere/play-safe";

export function EditorialFilm({
  poster,
  videoSrc,
  className = "aspect-[16/10] w-full",
  pauseLabel = "Pause film",
  playLabel = "Play film",
}: {
  poster: string;
  videoSrc?: string;
  className?: string;
  pauseLabel?: string;
  playLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedVideo, setFailedVideo] = useState(false);
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

  const showVideo = Boolean(videoSrc) && !reduce && !failedVideo;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;

    let alive = true;
    let pending: Promise<void> | null = null;
    const tryPlay = () => {
      if (!alive || paused) return;
      pending = playSafe(video);
    };
    tryPlay();
    video.addEventListener("canplay", tryPlay);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!alive) return;
        if (!entry.isIntersecting) {
          pauseSafe(video, pending);
          return;
        }
        tryPlay();
      },
      { threshold: 0.08 },
    );
    io.observe(video);
    return () => {
      alive = false;
      video.removeEventListener("canplay", tryPlay);
      io.disconnect();
    };
  }, [paused, showVideo]);

  function toggle() {
    const el = videoRef.current;
    if (!el) {
      setPaused((p) => !p);
      return;
    }
    if (el.paused) {
      void playSafe(el);
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          poster={poster}
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailedVideo(true)}
          data-hero-film={videoSrc}
          aria-hidden
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
      {showVideo ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? playLabel : pauseLabel}
          className="absolute bottom-3 right-3 z-10 min-h-11 min-w-11 border border-[rgba(196,162,100,0.45)] bg-[rgba(9,43,69,0.48)] px-3 text-[10px] tracking-[0.2em] uppercase text-[#faf8f2]"
        >
          {paused ? "Play" : "Pause"}
        </button>
      ) : null}
    </div>
  );
}
