import Link from "next/link";
import { FormalLockup } from "@/components/brand/logo";
import { FOOTER_PRIVATE } from "@/lib/copy/open-house";

export function PublicFooter() {
  return (
    <footer className="header-chrome py-12 text-[#faf8f2]">
      <div className="oh-wrap flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <FormalLockup knockout className="h-10 w-auto max-w-[min(90vw,20rem)]" />
          <p className="mt-3 text-sm text-[#efe6d4]/70">{FOOTER_PRIVATE}</p>
        </div>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/legal/privacy" className="min-h-11 inline-flex items-center">
            Privacy
          </Link>
          <Link href="/legal/terms" className="min-h-11 inline-flex items-center">
            Terms
          </Link>
          <Link href="/legal/community" className="min-h-11 inline-flex items-center">
            Community
          </Link>
          <Link href="/sign-in" className="min-h-11 inline-flex items-center">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
