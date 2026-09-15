import { ADMISSIONS_MONTHLY_CAP, CREDIT_PER_SUCCESSFUL_REFERRAL_USD } from "@/lib/rewards/types";
import { SOLICITING_BAN, SOLICITING_REFERRALS } from "@/lib/copy/community";

export const REWARDS_HEADLINE = "Referral Rewards";
export const REWARDS_BALANCE_LABEL = "Meridian Credit";
export const REWARDS_PARITY = "$1 = $1 toward redemptions.";
export const REWARDS_NOT_INVESTMENT =
  "Credit is house credit, not an investment product, brokerage, or share of membership.";
export const REWARDS_EARN = `Each person who joins through you and is admitted is worth $${CREDIT_PER_SUCCESSFUL_REFERRAL_USD.toLocaleString("en-US")} Meridian Credit.`;
export const REWARDS_SCARCITY = `No more than ${ADMISSIONS_MONTHLY_CAP} new members are admitted each month. A referral is scarce on purpose.`;
export const REWARDS_POLICY = `${SOLICITING_REFERRALS} Cold soliciting is still banned. ${SOLICITING_BAN}`;
export const REWARDS_EDITORIAL =
  "Cards and imagery are editorial. Nothing here is delivered gold, booked travel, or a completed evening until ops marks it fulfilled.";
export const REWARDS_MEMBERS_ONLY = "Referral Rewards are for members.";
export const REWARDS_LIFETIME = "Lifetime membership is $10,000.";
