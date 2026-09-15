"use client";

import { useEffect, useRef } from "react";

/** Soft grain + gold flecks. Desktop pointer shifts them; touch stays ambient. */
export function HeroAtmosphere() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;

    function apply(x: number, y: number) {
      host.style.setProperty("--hero-px", x.toFixed(3));
      host.style.setProperty("--hero-py", y.toFixed(3));
    }

    function tick() {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      apply(px, py);
      frame = window.requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch" || motion.matches || !fine.matches) return;
      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }

    function onLeave() {
      tx = 0;
      ty = 0;
    }

    if (motion.matches) {
      apply(0, 0);
      return;
    }

    if (fine.matches) {
      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerleave", onLeave);
      frame = window.requestAnimationFrame(tick);
    } else {
      el.dataset.ambient = "true";
    }

    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.cancelAnimationFrame(frame);
      host.style.removeProperty("--hero-px");
      host.style.removeProperty("--hero-py");
    };
  }, []);

  return (
    <div ref={root} className="hero-atmosphere" aria-hidden>
      <div className="hero-grain" />
      <div className="hero-flecks" />
    </div>
  );
}
