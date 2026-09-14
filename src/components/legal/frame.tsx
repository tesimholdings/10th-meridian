import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

export function LegalFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="safe-pad mx-auto min-h-dvh max-w-2xl py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">{title}</h1>
      <div className="mt-6 grid gap-4 text-ivory-muted leading-relaxed">{children}</div>
      <p className="mt-10 text-[11px] tracking-[0.16em] uppercase">
        <Link href="/">Return</Link>
      </p>
    </div>
  );
}
