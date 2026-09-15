import { PublicShell } from "@/components/open-house/public-shell";

export function LegalFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PublicShell wide>
      <h1 className="font-serif text-4xl">{title}</h1>
      <div className="mt-6 grid gap-4 leading-relaxed text-[var(--navy-soft)]">{children}</div>
    </PublicShell>
  );
}
