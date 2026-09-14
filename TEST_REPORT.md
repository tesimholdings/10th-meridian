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

Verified at 390×844 on the local preview server (`NEXT_PUBLIC_PREVIEW_TOOLS=true`):

- Lock screen remains the only public face; `/open-house` redirects guests when the window is closed
- Forced Open House: philosophy, who belongs, Index, scarcity, Founding/Standard placeholders only, SYNTHETIC DEMO initials, planned/concept experiences, sticky Apply / DEMO house CTAs
- Home / Matches: “Why you should meet”, Human-curated vs Algorithmic, Relevant / introduction status updates
- Members: search + refine filters, profile Message / Introduce
- Channels: drawer, thread, reaction, compose updates DEMO state
- Events: register copy stays “has not occurred”
- Approved-unpaid billing: invitation CTA + placeholders; Checkout 501 branded stub, no invented amount
- Admin: cap remaining + approve, weights save, required curation reason, schedule save, issue/revoke codes
- `/referral`: Open camera + paste; unknown/revoked share “That code cannot be used.”
- Onboarding 1/5 fits 390px; bottom nav + safe-area usable
- Reduced-motion: cinematic `.slow-drift` disabled via `prefers-reduced-motion`

## Runtime limitations

- Preview store is in-process and resets on server restart (must move to Supabase)
- Camera QR needs BarcodeDetector + permission; otherwise paste/link
- Stream compose is DEMO unless keys exist; not E2EE
- Stripe Checkout 501 until approved Price IDs exist — by design
- Legal pages and hero film still placeholders
- No production deploy

## Still Stefan’s

Approved prices, hero film, live keys, counsel-approved legal copy.
