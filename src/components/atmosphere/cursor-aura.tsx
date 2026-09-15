"use client";

import { useEffect, useRef, useState } from "react";

function luxuryCursorAllowed(fine: MediaQueryList, motion: MediaQueryList) {
  const touch = navigator.maxTouchPoints > 0 && !fine.matches;
  return fine.matches && !motion.matches && !touch;
}

export function CursorAura() {
  const dot = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function sync() {
      const next = luxuryCursorAllowed(fine, motion);
      setOn(next);
      document.documentElement.classList.toggle("has-luxury-cursor", next);
    }
    sync();
    fine.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      document.documentElement.classList.remove("has-luxury-cursor");
      fine.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!on) return;

    let x = 0;
    let y = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let frame = 0;
    let seeded = false;

    function move(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!seeded) {
        x = tx;
        y = ty;
        seeded = true;
      }
    }

    function tick() {
      x += (tx - x) * 0.38;
      y += (ty - y) * 0.38;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
      }
      frame = window.requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", move, { passive: true });
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      window.cancelAnimationFrame(frame);
    };
  }, [on]);

  if (!on) return null;

  return (
    <div ref={dot} className="cursor-aura" aria-hidden>
      <span className="cursor-aura-core" />
    </div>
  );
}
