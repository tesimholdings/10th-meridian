"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search.toString()}`;
  const first = useRef(true);
  const [play, setPlay] = useState(false);
  const [progress, setProgress] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPlay(true);
    setProgress(false);
    if (timer.current) window.clearTimeout(timer.current);
  }, [key]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (/^https?:/i.test(href)) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setProgress(true), 180);
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <>
      {progress ? <div className="nav-progress" aria-hidden /> : null}
      <div key={play ? key : "settled"} className={play ? "page-enter" : undefined}>
        {children}
      </div>
    </>
  );
}
