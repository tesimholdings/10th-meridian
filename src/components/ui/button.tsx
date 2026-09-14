import Link from "next/link";

type Variant = "gold" | "ghost" | "ivory";

const styles: Record<Variant, string> = {
  gold:
    "btn-gold-shine bg-[var(--gold)] text-[var(--void)] border border-[var(--gold)]",
  ghost:
    "bg-transparent text-ivory border border-[rgba(246,244,239,0.4)] hover:border-[var(--gold)]",
  ivory:
    "bg-ivory text-[var(--void)] border border-ivory hover:bg-white",
}

export function Button({
  href,
  children,
  variant = "gold",
  className = "",
  type = "button",
  disabled,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const cls = `btn-press inline-flex min-h-12 items-center justify-center px-5 text-[0.72rem] tracking-[0.22em] uppercase ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
