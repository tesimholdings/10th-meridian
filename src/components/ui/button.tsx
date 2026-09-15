import Link from "next/link";

type Variant = "gold" | "ghost" | "ivory" | "navy" | "quiet";

const styles: Record<Variant, string> = {
  gold:
    "bg-[#c4a264] text-[#092b45] border border-[#c4a264] hover:bg-[#b89454]",
  navy:
    "bg-[#092b45] text-[#faf8f2] border border-[#092b45] hover:bg-[#0c3858]",
  ghost:
    "bg-[rgba(250,248,242,0.16)] text-[#faf8f2] border border-[rgba(250,248,242,0.7)] hover:border-[#c4a264]",
  ivory:
    "bg-[#faf8f2] text-[#092b45] border border-[#faf8f2] hover:bg-white",
  quiet:
    "bg-transparent text-[#092b45] border border-[rgba(9,43,69,0.22)] hover:border-[#092b45]",
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
  const cls = `pressable inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm tracking-normal transition-[transform,background-color,border-color] duration-[var(--motion-press)] ${styles[variant]} ${className}`;
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
