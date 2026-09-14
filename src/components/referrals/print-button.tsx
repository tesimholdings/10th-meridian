"use client";

export function PrintButton({ label = "Print or save PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center border border-[var(--gold)] px-5 text-[11px] tracking-[0.18em] uppercase text-gold"
    >
      {label}
    </button>
  );
}
