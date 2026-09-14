import { Wordmark } from "@/components/brand/logo";
import { ReferralEntry } from "@/components/forms/referral-entry";
import { brand } from "@/lib/config/site";

export const metadata = { title: "Referral", robots: { index: false } };

export default async function ReferralPage({
  searchParams,
}: {
  searchParams: Promise<{ scan?: string }>;
}) {
  const { scan } = await searchParams;
  return (
    <div className="safe-pad mx-auto flex min-h-dvh max-w-md flex-col justify-center py-16">
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">A door, slightly earlier</h1>
      <p className="mt-3 text-sm text-ivory-muted">{brand.referralTone}</p>
      <div className="mt-8">
        <ReferralEntry scanHint={scan === "1"} />
      </div>
    </div>
  );
}
