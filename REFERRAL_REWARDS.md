# Referral Rewards

Review branch only. Do not merge to main. Do not deploy production.

Robinhood Gold Card Rewards–inspired **balance + unlock cards + reserve**, branded for Meridian. Not a credit card, not brokerage, not a Robinhood clone.

## Earn

- Members only.
- Each person who **joins through a member’s referral and is admitted** is worth **$1,000 Meridian Credit**.
- Credit is **$1 = $1** toward redemptions. Not an investment product.
- Granted **once** per successful referral. Declined / withdrawn never pay.
- Lifetime membership remains **$10,000**. No other membership prices.
- Network admissions cap remains **max 10 new members / month**. The Refer tab says this plainly so a referral feels scarce.

## Policy

Referrals are explicitly allowed. Cold soliciting is still banned — **ban, no refund**.

## Redeem (editable catalog)

Constants live in `src/lib/rewards/catalog.ts`. Add items there.

| Reward | Cost | Notes |
| --- | --- | --- |
| Trip credit | $1,000 | Destination + dates. Status: requested → approved → paid. |
| Gold bar | $1,000 toward | **Reserve** before full balance. Locked credit stays on this card until funded or cancelled. Shipping stub. Ops fulfills offline. |
| Open a Table | $1,000 | Host credit. Editorial fulfillment. |
| Yacht / water day | $1,000 | Ops fulfills offline. |
| Guest Open House pass | $1,000 | One guest, one night. Not membership. |
| Founders Circle | $3,000 | Locked until **3** successful referrals. |

Imagery and cards are editorial. Nothing claims delivered gold or booked travel until ops marks fulfilled.

## Click-path (demo)

1. Sign in as member (Reviewer tools → Preview as member) or open `/member/home`.
2. Home teaser **Referral Rewards** shows the available balance (seeded **$1,000** from one admitted referral).
3. Profile card and **More → Referral Rewards** also enter `/member/rewards`.
4. **Rewards** — large balance, unlock cards, progress rings. Reserve gold. Request trip credit.
5. **Refer** — personal code `VOSS-10` (demo-stable for A. Voss), copy link, submit a name. List shows Submitted → Invited → Applied → Admitted → Credited. Preview: advance walks the pipeline; **Admitted grants +$1,000 once**.
6. **Activity** — ledger + redemptions. Trip stipend can be preview-advanced requested → approved → paid.

Seed: L. Moreau (credited, +$1,000) and S. Rahman (applied, no credit). Math must stay $1,000 available until you reserve or redeem.

## Out of scope

Real Stripe payouts, real gold shipping, real travel booking, stocks, changing the $10k lifetime price, or changing the 10/month cap.
