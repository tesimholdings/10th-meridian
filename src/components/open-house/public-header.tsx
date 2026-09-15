"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/logo";
import { APPLY_LABEL, PUBLIC_NAV } from "@/lib/copy/open-house";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function PublicHeader({
  overlay = false,
  landing = false,
}: {
  overlay?: boolean;
  landing?: boolean;
}) {
  const [scrolled, setScrolled] = useState(!overlay);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const paper = !overlay || scrolled || menuOpen;
  const surface = paper ? "light" : "dark";

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    const trigger = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      trigger?.focus();
    };
  }, [menuOpen]);

  function hrefFor(item: (typeof PUBLIC_NAV)[number]) {
    if (item.href.startsWith("#")) {
      return landing ? item.href : item.pageHref;
    }
    return item.href;
  }

  return (
    <header
      className={`safe-pad safe-top sticky top-0 z-40 transition-[background-color,backdrop-filter,border-color,color] duration-300 ${
        paper
          ? "border-b border-[rgba(9,43,69,0.08)] bg-[rgba(250,248,242,0.88)] text-[var(--navy)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent text-[#faf8f2]"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-3">
        <Link href="/" className="min-h-11 shrink-0" aria-label="10th Meridian home">
          <Wordmark compact surface={surface} />
        </Link>

        <nav aria-label="Open House" className="ml-auto hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.label}
              href={hrefFor(item)}
              className="inline-flex min-h-11 items-center px-3 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/apply"
          className="ml-auto inline-flex min-h-11 items-center rounded-full bg-[#c4a264] px-4 text-sm text-[#092b45] lg:ml-3"
        >
          {APPLY_LABEL}
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center lg:hidden"
          aria-expanded={menuOpen}
          aria-controls={titleId}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[rgba(16,33,45,0.28)]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={panelRef}
            id={titleId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-x-0 top-[4.25rem] z-50 border-b border-[rgba(9,43,69,0.08)] bg-[var(--paper)] text-[var(--navy)] shadow-lg"
          >
            <nav aria-label="Mobile" className="safe-pad mx-auto grid max-w-6xl py-3">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.label}
                  href={hrefFor(item)}
                  className="flex min-h-12 items-center text-base"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      {open ? (
        <path d="M5 5 L17 17 M17 5 L5 17" stroke="currentColor" strokeWidth="1.6" />
      ) : (
        <path d="M4 7 H18 M4 11 H18 M4 15 H18" stroke="currentColor" strokeWidth="1.6" />
      )}
    </svg>
  );
}
