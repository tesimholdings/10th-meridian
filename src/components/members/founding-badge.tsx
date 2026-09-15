import { FOUNDING_MEMBER } from "@/lib/copy/ui";

export function FoundingBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`pill ${compact ? "!min-h-6 !px-2 !text-[10px]" : ""}`}>
      {FOUNDING_MEMBER}
    </span>
  );
}
