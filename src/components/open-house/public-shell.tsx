import { PublicFooter } from "@/components/open-house/public-footer";
import { PublicHeader } from "@/components/open-house/public-header";

export function PublicShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="house-light min-h-dvh text-[var(--navy)]">
      <PublicHeader />
      <main className={`safe-pad mx-auto py-12 ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
