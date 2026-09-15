"use client";

import { useEffect, useRef } from "react";

/** Pointer-driven grain, gold lamp, and flecks. Touch stays ambient. */
export function HeroAtmosphere() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const host = el.parentElement;
    if (!host) return;
    const surface: HTMLElement = host;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let px = 0;
    let py = 0;
    let mx = 50;
    let my = 42;
    let tx = 0;
    let ty = 0;
    let tmx = 50;
    let tmy = 42;
    let frame = 0;

    function apply() {
      surface.style.setProperty("--hero-px", px.toFixed(3));
      surface.style.setProperty("--hero-py", py.toFixed(3));
      surface.style.setProperty("--hero-mx", `${mx.toFixed(2)}%`);
      surface.style.setProperty("--hero-my", `${my.toFixed(2)}%`);
    }

    function tick() {
      px += (tx - px) * 0.14;
      py += (ty - py) * 0.14;
      mx += (tmx - mx) * 0.16;
      my += (tmy - my) * 0.16;
      apply();
      frame = window.requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch" || motion.matches) return;
      const rect = surface.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (e.clientY < rect.top - 80 || e.clientY > rect.bottom + 40) return;
      tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      tmx = ((e.clientX - rect.left) / rect.width) * 100;
      tmy = ((e.clientY - rect.top) / rect.height) * 100;
    }

    if (motion.matches) {
      apply();
      el.dataset.reduced = "true";
      return;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = window.requestAnimationFrame(tick);
    if (!fine.matches) el.dataset.ambient = "true";

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
      surface.style.removeProperty("--hero-px");
      surface.style.removeProperty("--hero-py");
      surface.style.removeProperty("--hero-mx");
      surface.style.removeProperty("--hero-my");
    };
  }, []);

  return (
    <div ref={root} className="hero-atmosphere" aria-hidden>
      <div className="hero-shade" />
      <div className="hero-lamp" />
      <div className="hero-caustic" />
      <div className="hero-sheet" />
      <div className="hero-wash" />
      <div className="hero-grain" />
      <div className="hero-flecks" />
    </div>
  );
}
