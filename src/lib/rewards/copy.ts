import { ADMISSIONS_MONTHLY_CAP, POINTS_PER_SUCCESSFUL_REFERRAL } from "@/lib/rewards/types";
import { SOLICITING_BAN, SOLICITING_REFERRALS } from "@/lib/copy/community";

export const REWARDS_HEADLINE = "Referral Rewards";
export const REWARDS_BALANCE_LABEL = "Points";
export const REWARDS_PARITY = "10 pts = $1,000 toward redemptions.";
export const REWARDS_NOT_INVESTMENT =
  "Points are house credit, not an investment product, brokerage, or share of membership.";
export const REWARDS_EARN = `Each person who joins through you and is admitted is worth ${POINTS_PER_SUCCESSFUL_REFERRAL} points.`;
export const REWARDS_SCARCITY = `No more than ${ADMISSIONS_MONTHLY_CAP} new members are admitted each month. A referral is scarce on purpose.`;
export const REWARDS_POLICY = `${SOLICITING_REFERRALS} Cold soliciting is still banned. ${SOLICITING_BAN}`;
export const REWARDS_EDITORIAL =
  "Cards and imagery are editorial. Nothing here is delivered gold, booked travel, or a completed evening until ops marks it fulfilled.";
export const REWARDS_MEMBERS_ONLY = "Referral Rewards are for members.";
export const REWARDS_PRICING =
  "Founding Ten enter at $5,000. After that: $10,000 to enter plus $195 each month. Points never discount membership.";
