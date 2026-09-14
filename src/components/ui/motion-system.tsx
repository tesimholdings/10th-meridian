"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

let manualPause = false;
const listeners = new Set<() => void>();
function subscribePause(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
function useMotion() {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const paused = useSyncExternalStore(
    subscribePause,
    () => manualPause,
    () => false,
  );
  return { reduced, paused, off: reduced || paused };
}

/** Motion never gates content. All sections remain visible without JavaScript. */
export function MotionSystem() {
  const pathname = usePathname();
  const { off } = useMotion();

  useEffect(() => {
    document.documentElement.dataset.motion = off ? "off" : "on";
    if (off) return;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          const animation = target.animate(
            [
              { opacity: 0.2, transform: "translateY(22px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 850, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
          observer.unobserve(target);
        });
      },
      { threshold: 0.08 },
    );
    const registered = new WeakSet<Element>();
    const register = () =>
      document
        .querySelectorAll(
          "[data-reveal], .member-main section, .editorial-section",
        )
        .forEach((el) => {
          if (!registered.has(el)) {
            registered.add(el);
            observer.observe(el);
          }
        });
    register();
    const mutations = new MutationObserver((records) => {
      if (
        records.some((record) =>
          [...record.addedNodes].some((node) => node.nodeType === 1),
        )
      )
        register();
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const visibility = () => {
      document.documentElement.dataset.backgroundHidden = String(
        document.hidden,
      );
      animations.forEach((a) => {
        if (document.hidden) a.pause();
        else if (a.playState === "paused") a.play();
      });
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      mutations.disconnect();
      observer.disconnect();
      animations.forEach((a) => a.cancel());
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [pathname, off]);

  return null;
}

export function MotionControl() {
  const { off, paused, reduced } = useMotion();
  return (
    <button
      type="button"
      className="motion-control"
      onClick={() => {
        manualPause = !manualPause;
        listeners.forEach((listener) => listener());
      }}
      disabled={reduced}
      aria-label={
        reduced
          ? "Reduced motion enabled"
          : paused
            ? "Resume animations"
            : "Pause animations"
      }
      aria-pressed={off}
      title={
        reduced
          ? "Reduced motion enabled"
          : paused
            ? "Resume animations"
            : "Pause animations"
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        {off ? (
          <path d="m7 4 8 6-8 6Z" />
        ) : (
          <path d="M7 4v12M13 4v12" strokeWidth="2" />
        )}
      </svg>
    </button>
  );
}
