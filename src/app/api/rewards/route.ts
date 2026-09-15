import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import {
  advanceMemberRedemption,
  advanceMemberReferral,
  cancelMemberReservation,
  requestMemberRedemption,
  reserveMemberReward,
  submitMemberReferral,
  viewerRewardsSnapshot,
  withdrawMemberReferral,
} from "@/lib/preview/store";
import type { AppRole } from "@/lib/data/types";

const memberRoles: AppRole[] = ["member", "moderator", "administrator"];

function isRewardsMember(role: AppRole | undefined): boolean {
  return Boolean(role && memberRoles.includes(role));
}

const submitSchema = z.object({
  action: z.literal("submit-referral"),
  fullName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  linkedin: z.string().max(200).optional(),
  city: z.string().min(2).max(80),
  howYouKnowThem: z.string().min(8).max(400),
  note: z.string().max(400).optional(),
});

const idSchema = z.object({
  action: z.enum(["withdraw-referral", "advance-referral", "decline-referral", "cancel-reserve", "advance-redemption"]),
  id: z.string().min(3),
});

const reserveSchema = z.object({
  action: z.literal("reserve"),
  rewardId: z.string().min(2),
});

const redeemSchema = z.object({
  action: z.literal("redeem"),
  rewardId: z.string().min(2),
  destination: z.string().max(80).optional(),
  startDate: z.string().max(32).optional(),
  endDate: z.string().max(32).optional(),
  guestName: z.string().max(80).optional(),
  shippingName: z.string().max(80).optional(),
  shippingCity: z.string().max(80).optional(),
  shippingRegion: z.string().max(80).optional(),
  shippingCountry: z.string().max(80).optional(),
});

export async function GET() {
  const access = await resolveAccessContext();
  if (!isRewardsMember(access.user?.role)) {
    return Response.json({ ok: false, message: "Members only." }, { status: 403 });
  }
  return Response.json({ ok: true, snapshot: viewerRewardsSnapshot() });
}

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (!isRewardsMember(access.user?.role)) {
    return Response.json({ ok: false, message: "Referral Rewards are for members." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const action = body && typeof body === "object" ? (body as { action?: string }).action : null;

  if (action === "submit-referral") {
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, message: "Check the referral details." }, { status: 400 });
    const result = submitMemberReferral(parsed.data);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "withdraw-referral" || action === "advance-referral" || action === "decline-referral" || action === "cancel-reserve" || action === "advance-redemption") {
    const parsed = idSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, message: "Missing id." }, { status: 400 });
    if (action === "withdraw-referral") {
      const result = withdrawMemberReferral(parsed.data.id);
      return Response.json(result, { status: result.ok ? 200 : 400 });
    }
    if (action === "advance-referral") {
      const result = advanceMemberReferral(parsed.data.id);
      return Response.json(result, { status: result.ok ? 200 : 400 });
    }
    if (action === "decline-referral") {
      const result = advanceMemberReferral(parsed.data.id, "declined");
      return Response.json(result, { status: result.ok ? 200 : 400 });
    }
    if (action === "cancel-reserve") {
      const result = cancelMemberReservation(parsed.data.id);
      return Response.json(result, { status: result.ok ? 200 : 400 });
    }
    const result = advanceMemberRedemption(parsed.data.id);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "reserve") {
    const parsed = reserveSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, message: "Choose a reward." }, { status: 400 });
    const result = reserveMemberReward(parsed.data.rewardId);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "redeem") {
    const parsed = redeemSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, message: "Check the redemption details." }, { status: 400 });
    const result = requestMemberRedemption(parsed.data);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  }

  return Response.json({ ok: false, message: "Unknown action." }, { status: 400 });
}
