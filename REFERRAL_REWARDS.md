# Referral Rewards

Review branch only. Do not merge to main. Do not deploy production.

Robinhood Gold Card Rewards–inspired **balance + unlock cards + reserve**, branded for Meridian. Not a credit card, not brokerage, not a Robinhood clone.

## Earn

- Members only.
- Each person who **joins through a member’s referral and is admitted** is worth **10 points**.
- Internally **10 points = $1,000** toward redemptions. Ledger still stores USD; **the UI shows points first**.
- Granted **once** per successful referral. Declined / withdrawn never pay.
- Membership prices are **Founding Ten $5,000** (first 10 members) then **$10,000 entry + $195/month**. Points never discount those amounts.
- Network admissions cap remains **max 10 new members / month**. The Refer tab says this plainly so a referral feels scarce.

## Policy

Referrals are explicitly allowed. Cold soliciting is still banned — **ban, no refund**.

## Redeem (editable catalog)

Constants live in `src/lib/rewards/catalog.ts`. Add items there. Costs are points; 10 pts = $1,000.

| Reward | Cost | Notes |
| --- | --- | --- |
| Trip credit | 10 pts | Destination + dates. Status: requested → approved → paid. |
| Gold bar | 10 pts toward | **Reserve** before full balance. Locked points stay on this card until funded or cancelled. Shipping stub. Ops fulfills offline. |
| Open a Table | 10 pts | Host credit. Editorial fulfillment. |
| Yacht / water day | 10 pts | Ops fulfills offline. |
| Guest Open House pass | 10 pts | One guest, one night. Not membership. |
| Founders Circle | 30 pts | Locked until **3** successful referrals. |

Imagery and cards are editorial. Nothing claims delivered gold or booked travel until ops marks fulfilled.

## Click-path (demo)

1. Sign in as member (Reviewer tools → Preview as member) or open `/member/home`.
2. Home teaser **Referral Rewards** shows the available **points** (seeded **10 pts** from one admitted referral).
3. Profile card and **More → Referral Rewards** also enter `/member/rewards`.
4. **Rewards** — large points balance, unlock cards, progress rings. Reserve gold. Request trip credit.
5. **Refer** — personal code `VOSS-10` (demo-stable for A. Voss), copy link, submit a name. List shows Submitted → Invited → Applied → Admitted → Credited. Preview: advance walks the pipeline; **Admitted grants +10 pts once**.
6. **Activity** — ledger + redemptions in points. Trip stipend can be preview-advanced requested → approved → paid.

Seed: L. Moreau (credited, +10 pts) and S. Rahman (applied, no credit). Math must stay 10 pts available until you reserve or redeem.

## Out of scope

Real Stripe payouts, real gold shipping, real travel booking, stocks, changing Founding/Standard prices, or changing the 10/month admissions cap.
