# TEST_REPORT — 10th Meridian Wave 2

Date: 2026-09-14  
Branch: `cursor/10th-meridian-foundation-da65`  
Runtime: Node 22.14, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | Pass — 18/18 (Open House clock, Meridian Index, preview store) |
| `npm run lint` | Pass |
| `npm run build` | Pass — no live keys required |

New coverage includes: decline/hide not reappearing, suppress curation, weight edits changing scores, monthly cap + override, revoked vs unknown referral copy, approved-unpaid always-on access.

## HTTP / product behavior

Verified in Wave 1 and extended in Wave 2:

- Lock screen remains the only public face outside the tenth
- Forced Open House landing: philosophy, who belongs, Index explainer, scarcity, **price placeholders only**
- Matches feedback and introductions write to the preview store and change the Index
- Directory filters + `/member/members/[id]` Message / Request introduction
- Channels compose / thread / reactions / unreads persist in DEMO state
- Events register/waitlist never labeled as completed real-world events
- Approved-unpaid billing CTA; Stripe Checkout still 501 without approved Price IDs
- Admin admissions cap, weights, Open House schedule, referral issue/revoke, curation with required reason
- Camera QR: BarcodeDetector path + paste fallback; generic failure copy unchanged
- `TENTH-EARLY` succeeds; expired/revoked/unknown share “That code cannot be used.”

## Browser

Wave 2 surfaces are built mobile-first (390px, safe-area, reduced-motion on cinematic motion). Reviewer should click through the README list on a phone viewport.

## Runtime limitations

- Preview store is in-process and resets on server restart (must move to Supabase)
- Camera QR needs BarcodeDetector + permission; otherwise paste/link
- Stream compose is DEMO unless keys exist; not E2EE
- Stripe Checkout 501 until approved Price IDs exist — by design
- Legal pages and hero film still placeholders
- No production deploy

## Still Stefan’s

Approved prices, hero film, live keys, counsel-approved legal copy.
