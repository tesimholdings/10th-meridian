"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type OverflowItem = {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
};

export function OverflowMenu({ items, disabled = false }: { items: OverflowItem[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 232;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2, width / 2 + 12),
        window.innerWidth - width / 2 - 12,
      );
      const below = rect.bottom + 8;
      const top = below + 280 > window.innerHeight ? Math.max(12, rect.top - 8) : below;
      setBox({ top, left });
    }
    place();
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    });
    function onPointer(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>("button:not([disabled]), a")];
      if (!nodes.length) return;
      event.preventDefault();
      const current = document.activeElement;
      const index = nodes.findIndex((node) => node === current);
      const next =
        event.key === "ArrowDown"
          ? nodes[(index + 1 + nodes.length) % nodes.length]
          : nodes[(index - 1 + nodes.length) % nodes.length];
      next?.focus();
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const panel =
    open && box && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            className="overflow-panel"
            style={{ top: box.top, left: box.left }}
          >
            {items.map((item) =>
              item.href ? (
                <a key={item.id} role="menuitem" href={item.href} className="overflow-item" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="overflow-item"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="overflow-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="action-quiet"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        More
      </button>
      {panel}
    </div>
  );
}
