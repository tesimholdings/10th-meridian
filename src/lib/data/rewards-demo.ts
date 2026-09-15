import { viewerDemoProfile } from "@/lib/data/demo";
import { CREDIT_PER_SUCCESSFUL_REFERRAL_USD } from "@/lib/rewards/types";
import type {
  CreditLedgerEntry,
  MemberReferral,
  RewardRedemption,
  RewardReservation,
  RewardsState,
} from "@/lib/rewards/types";

const memberId = viewerDemoProfile.id;

const credited: MemberReferral = {
  id: "mref-demo-credited",
  referrerId: memberId,
  fullName: "L. Moreau",
  email: "l.moreau@example.test",
  linkedin: "https://www.linkedin.com/in/demo-moreau",
  city: "Lisbon",
  howYouKnowThem: "Shared a workshop in 2019. Quiet, finishes work.",
  note: "Would hold a table well.",
  status: "credited",
  credited: true,
  creditedAt: "2026-09-02T14:00:00.000Z",
  createdAt: "2026-08-20T11:00:00.000Z",
  updatedAt: "2026-09-02T14:00:00.000Z",
  isDemo: true,
};

const applied: MemberReferral = {
  id: "mref-demo-applied",
  referrerId: memberId,
  fullName: "S. Rahman",
  email: "s.rahman@example.test",
  city: "London",
  howYouKnowThem: "Introduced through a host in Marylebone.",
  note: "Applied. Still under review.",
  status: "applied",
  credited: false,
  createdAt: "2026-09-08T09:30:00.000Z",
  updatedAt: "2026-09-11T16:10:00.000Z",
  isDemo: true,
};

const admissionCredit: CreditLedgerEntry = {
  id: "led-demo-moreau",
  memberId,
  amountUsd: CREDIT_PER_SUCCESSFUL_REFERRAL_USD,
  kind: "referral_admission",
  referralId: credited.id,
  memo: "Admitted through your referral. $1,000 Meridian Credit.",
  createdAt: "2026-09-02T14:00:00.000Z",
  isDemo: true,
};

export function seedRewardsState(): RewardsState {
  return {
    referrals: [applied, credited],
    ledger: [admissionCredit],
    reservations: [] as RewardReservation[],
    redemptions: [] as RewardRedemption[],
  };
}
