import { Wordmark } from "@/components/brand/logo";
import { QrScanner } from "@/components/referrals/qr-scanner";
import { PreviewTools } from "@/components/preview/preview-tools";
import { brand } from "@/lib/config/site";
import { resolveAccessContext } from "@/lib/access/context";

export const metadata = { title: "Referral", robots: { index: false } };

export default async function ReferralPage() {
  const access = await resolveAccessContext();
  return (
    <div className="safe-pad mx-auto flex min-h-dvh max-w-md flex-col justify-center py-16">
      <PreviewTools access={access} />
      <Wordmark compact />
      <h1 className="mt-10 font-serif text-4xl">A door, slightly earlier</h1>
      <p className="mt-3 text-sm text-ivory-muted">{brand.referralTone}</p>
      <div className="mt-8">
        <QrScanner />
      </div>
    </div>
  );
}
