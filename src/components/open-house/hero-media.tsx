"use client";

import { useEffect, useState } from "react";

export function HeroMedia({
  src,
  mobileSrc,
}: {
  src: string;
  mobileSrc: string;
}) {
  const [failed, setFailed] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (failed) {
    return <div className="water absolute inset-0" data-hero-fallback="water" aria-hidden />;
  }

  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-cover object-center ${
          reduce ? "" : "slow-drift"
        }`}
      />
    </picture>
  );
}
