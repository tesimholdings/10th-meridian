# TEST_REPORT — 10th Meridian foundation

Date: 2026-09-14  
Branch: `cursor/10th-meridian-foundation-da65`  
Runtime: Node 22.14, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm install` | Pass |
| `npm test` | Pass — 9/9 (Open House clock + Meridian Index) |
| `npm run lint` | Pass |
| `npm run build` | Pass — no env required; Proxy + 29 routes |

Build does **not** need live Supabase/Stripe/Stream/Resend keys.

## HTTP / server behavior (`next start`, 2026-09-14, America/Chicago)

Today is not the 10th, so the public house is locked.

| Check | Result |
| --- | --- |
| `GET /` lock screen | 200 — “The doors open on the tenth.”, Remind Me, 10th Meridian |
| `GET /api/open-house` | `phase: locked`, `allowed: false`, next open 2026-10-10 |
| `GET /api/health` | preview; supabase/stripe/stream/resend all stub |
| `GET /member/home` unauthenticated | 307 → `/` |
| `POST /api/applications` while locked | 403 “Applications open during Open House.” |
| `TENTH-EARLY` | ok + referral tone |
| `TENTH-EXPIRED` / `TENTH-REVOKED` / unknown | same generic “That code cannot be used.” |
| Preview member session | `/member/home` 200; Meridian 10 present |
| `/member/matches` | Human-curated + Algorithmic signal + SYNTHETIC DEMO |
| Member hitting `/admin` | redirected away from steward desk |
| Preview admin | `/admin` 200 — Steward desk, monthly cap, stubs |
| Force Open House cookie | `/open-house` 200 with price **placeholders** |
| Remind form | stub send + “not an application” |
| Stripe Checkout without keys | 501, no invented amount |
| QR `TENTH-EARLY` | 200 `image/svg+xml`; unknown 404 |
| `GET /robots.txt` | 200; `/member/` and `/admin/` disallowed |

`GET /api/open-house` confirms the **server** clock, not the browser.

## Browser walkthrough (390×844)

Exercised lock screen, reviewer Preview as member (Home / Matches / Channels drawer / Members / Profile / Events / Billing / Resources / Settings / Sign Out), Preview as admin (overview, admissions, matching weights, Open House schedule), Force Open House, and `/remind` submit.

Confirmed:

- No invented membership dollar amounts — only `[INSERT APPROVED FOUNDING PRICE]` / `[INSERT APPROVED STANDARD PRICE]`
- Initials only; SYNTHETIC DEMO labels
- Bottom nav: Home · Matches · Channels · Members · Profile
- Human-curated vs algorithmic match labels
- Remind success copy

Lock-screen CTAs were tightened after the first pass so Sign In, referral, QR, and Remind Me sit closer together on a phone.

## Runtime limitations

- Preview roles are signed cookies (`PREVIEW_DEMO_AUTH`); hide in production
- Open House force cookie / `OPEN_HOUSE_FORCE` are preview-only
- In-memory rate limits reset on cold start
- Stream compose does not persist
- Stripe Checkout is 501 until approved Price IDs exist — by design
- Storage SQL may need the Supabase dashboard
- Semantic layer without `OPENAI_API_KEY` is lexical, not a hosted model
- Camera QR scan is not implemented (paste / link / SVG QR are)
- Legal pages are placeholders
- No production deploy was performed

## Not verified

- Live Stripe CLI webhooks
- Live Stream moderation
- Live Resend domain send
- pgvector at scale
- Production RLS with real Auth users
