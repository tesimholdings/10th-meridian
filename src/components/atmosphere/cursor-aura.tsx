"use client";

import { useEffect, useRef, useState } from "react";

export function CursorAura() {
  const dot = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touch = navigator.maxTouchPoints > 0 && !fine.matches;

    function sync() {
      setOn(fine.matches && !motion.matches && !touch);
    }
    sync();
    fine.addEventListener("change", sync);
    motion.addEventListener("change", sync);

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;

    function move(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
    }

    function tick() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`;
      }
      frame = window.requestAnimationFrame(tick);
    }

    if (fine.matches && !motion.matches && !touch) {
      window.addEventListener("pointermove", move, { passive: true });
      frame = window.requestAnimationFrame(tick);
    }

    return () => {
      fine.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
      window.removeEventListener("pointermove", move);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!on) return null;

  return <div ref={dot} className="cursor-aura" aria-hidden />;
}
