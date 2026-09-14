# TEST_REPORT — 10th Meridian UI polish (Wave 3)

Date: 2026-09-14  
Branch: `cursor/ui-polish-wave3-907d`  
Base: `cursor/crossings-travel-1da1`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | Pass — 50 tests (Lifetime $10,000 + visitor IANA Open House) |
| `npm run lint` | Pass |
| `npm run build` | Pass — includes `/member/index` and `/referral/[code]/card` |

Product logic unchanged except: Stripe checkout mode (`payment` for Lifetime); public product list (Lifetime + Organization); Open House window evaluated in the visitor IANA timezone (server clock + validated zone name). Coverage remains: journey CRUD; ranking exclusions; Crossing accept/decline; Open House isolation; `.ics` after acceptance; visitor TZ vs Chicago.

## Product decisions recorded

- Lifetime **$10,000** one-time shown on Open House, Billing, admin billing
- Admissions cap still 10 / month
- Referral card print path `/referral/{code}/card`
- Planned domain `tenmeridian.com` documented only
- Chrome: gold / white / black. Atmosphere: original harbor daylight + yacht night lights (not stock)
- Motion: animation-heavy, reduced-motion honored
- Member nav: **Index** (never “Matches”); Meridian 10 / 100 / Index kept
- Open House: 10:00–22:00 visitor local; referral 09:00 local; fallback America/Chicago
- Anti-soliciting: ban with no refund, surfaced on Open House / onboarding / legal / compose

## Privacy (unchanged)

City-level only. No flight numbers, hotel stays, room numbers, GPS, or live location.

## Runtime limitations

- Preview store resets on server restart
- Stripe Checkout 501 without keys / Lifetime Price ID
- No production deploy, no domain purchase
