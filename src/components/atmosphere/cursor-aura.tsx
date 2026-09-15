"use client";

import { useEffect, useRef, useState } from "react";

function luxuryCursorAllowed(
  fine: MediaQueryList,
  motion: MediaQueryList,
  pointerType?: string,
) {
  if (motion.matches) return false;
  if (pointerType === "touch") return false;
  const touchPrimary = navigator.maxTouchPoints > 0 && !fine.matches;
  if (fine.matches && !touchPrimary) return true;
  return pointerType === "mouse" || pointerType === "pen";
}

export function CursorAura() {
  const dot = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function apply(next: boolean) {
      setOn(next);
      document.documentElement.classList.toggle("has-luxury-cursor", next);
    }

    function sync() {
      apply(luxuryCursorAllowed(fine, motion));
    }

    function onMove(e: PointerEvent) {
      if (luxuryCursorAllowed(fine, motion, e.pointerType)) {
        apply(true);
        return;
      }
      if (motion.matches || e.pointerType === "touch") apply(false);
    }

    sync();
    fine.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.documentElement.classList.remove("has-luxury-cursor");
      fine.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
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
