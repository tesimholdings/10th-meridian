"use client";

import { useEffect, useRef, useState } from "react";

export function HeroMedia({
  src,
  mobileSrc,
  videoSrc,
  pauseLabel = "Pause film",
  playLabel = "Play film",
}: {
  src: string;
  mobileSrc: string;
  videoSrc?: string;
  pauseLabel?: string;
  playLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedPoster, setFailedPoster] = useState(false);
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
    const tryPlay = () => {
      if (!alive || paused) return;
      void video.play().catch(() => {});
    };
    tryPlay();
    video.addEventListener("canplay", tryPlay);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!alive) return;
        if (!entry.isIntersecting) {
          video.pause();
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
      void el.play().catch(() => {});
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  }

  if (failedPoster && !showVideo) {
    return <div className="water absolute inset-0" data-hero-fallback="water" aria-hidden />;
  }

  return (
    <>
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileSrc} />
        <img
          src={src}
          alt=""
          onError={() => setFailedPoster(true)}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 z-[1] h-full w-full object-cover object-center"
          poster={src}
          muted
          loop
          playsInline
          autoPlay
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
          className="absolute top-[5.5rem] right-4 z-20 min-h-11 min-w-11 border border-[rgba(196,162,100,0.45)] bg-[rgba(9,43,69,0.48)] px-3 text-[10px] tracking-[0.2em] uppercase text-[#faf8f2]"
        >
          {paused ? "Play" : "Pause"}
        </button>
      ) : null}
    </>
  );
}
