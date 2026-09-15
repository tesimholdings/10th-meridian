import { env } from "@/lib/env";
import { FOUNDING_TEN_CAP, type MembershipOffer } from "@/lib/stripe/catalog";
import {
  foundingSeatsTaken,
  hadPaidMembership,
  membershipFor,
} from "@/lib/preview/store";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type OfferResolution = {
  offer: MembershipOffer;
  foundingTaken: number;
  foundingRemaining: number;
  reason: "founding-open" | "founding-full" | "rejoin" | "already-active";
};

export async function resolveMembershipOffer(input: {
  accountId?: string;
  email?: string;
}): Promise<OfferResolution> {
  const taken = await countFoundingSeats();
  const remaining = Math.max(0, (env.foundingTenCap || FOUNDING_TEN_CAP) - taken);
  const existing = membershipFor(input.accountId, input.email);
  if (existing?.status === "active") {
    return {
      offer: existing.product,
      foundingTaken: taken,
      foundingRemaining: remaining,
      reason: "already-active",
    };
  }
  if (existing?.status === "canceled" || hadPaidMembership(input.accountId, input.email)) {
    return {
      offer: "standard",
      foundingTaken: taken,
      foundingRemaining: remaining,
      reason: "rejoin",
    };
  }
  if (remaining > 0) {
    return {
      offer: "founding",
      foundingTaken: taken,
      foundingRemaining: remaining,
      reason: "founding-open",
    };
  }
  return {
    offer: "standard",
    foundingTaken: taken,
    foundingRemaining: 0,
    reason: "founding-full",
  };
}

export async function countFoundingSeats(): Promise<number> {
  const preview = foundingSeatsTaken();
  const admin = getSupabaseAdmin();
  if (!admin) return preview;
  try {
    const { count, error } = await admin
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("product", "founding");
    if (error || count == null) return preview;
    return Math.max(preview, count);
  } catch {
    return preview;
  }
}
