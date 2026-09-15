"use client";

import { useEffect, useRef } from "react";

/** Luxury gold wash that follows a fine pointer. Off for touch and reduced motion. */
export function LockGrain() {
  const wash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touch = navigator.maxTouchPoints > 0 && !fine.matches;
    if (!fine.matches || motion.matches || touch) return;

    function move(e: PointerEvent) {
      if (e.pointerType === "touch" || !wash.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      wash.current.style.setProperty("--lock-mx", `${x}%`);
      wash.current.style.setProperty("--lock-my", `${y}%`);
    }

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      <div className="lock-gold-glow" aria-hidden />
      <div className="grain lock-gold-grain" aria-hidden />
      <div ref={wash} className="lock-gold-follow" aria-hidden />
    </>
  );
}
