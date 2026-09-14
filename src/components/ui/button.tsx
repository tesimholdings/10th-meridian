import Link from "next/link";

type Variant = "gold" | "ghost" | "ivory";

const styles: Record<Variant, string> = {
  gold:
    "bg-[var(--gold)] text-[var(--void)] border border-[var(--gold)] hover:bg-[#c4a05c]",
  ghost:
    "bg-transparent text-ivory border border-[var(--line-strong)] hover:border-[var(--gold)]",
  ivory:
    "bg-ivory/95 text-[var(--void)] border border-ivory hover:bg-ivory",
};

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
  const cls = `inline-flex min-h-12 items-center justify-center px-5 text-[0.72rem] tracking-[0.22em] uppercase transition duration-300 ${styles[variant]} ${className}`;
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
