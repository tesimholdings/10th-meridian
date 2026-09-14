import { notFound } from "next/navigation";
import Link from "next/link";
import { ReferralCard } from "@/components/referrals/referral-card";
import { PrintButton } from "@/components/referrals/print-button";
import { validateReferralCode } from "@/lib/referrals/validate";
import { brand } from "@/lib/config/site";

export const metadata = {
  title: "Referral card",
  robots: { index: false },
};

export default async function ReferralCardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw);
  const result = validateReferralCode(code);
  if (!result.ok) notFound();
  const qrSrc = `/api/referrals/qr?code=${encodeURIComponent(code)}`;

  return (
    <div className="referral-card-print min-h-dvh bg-void text-ivory">
      <div className="no-print safe-pad mx-auto flex max-w-3xl items-center justify-between py-6">
        <p className="label">{brand.name}</p>
        <Link href="/admin/referrals" className="inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] uppercase text-ivory-muted">
          Steward desk
        </Link>
      </div>
      <div className="safe-pad mx-auto max-w-3xl pb-16">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl">Referral card</h1>
          <PrintButton />
        </div>
        <ReferralCard code={code} qrSrc={qrSrc} />
        <p className="no-print mt-6 max-w-lg text-sm leading-relaxed text-ivory-dim">
          Original 10th Meridian card. Gold fittings, black structure, sailor water. Print in color
          with backgrounds enabled. QR opens this house at the referral door — never a third-party mark.
        </p>
      </div>
    </div>
  );
}
