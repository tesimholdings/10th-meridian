# TEST_REPORT — 10th Meridian foundation

Date: 2026-09-14  
Branch: `cursor/10th-meridian-foundation-da65`  
Runtime: Node 22, Next.js 16, preview mode (no live secrets)

## Verified in this pass

| Check | Result |
| --- | --- |
| `npm install` | Recorded after scaffold + integration packages |
| `npm test` (Meridian Index + Open House clock) | Pending in this draft — updated after CI-equivalent local run |
| `npm run build` | Pending in this draft — updated after local run |
| Lock screen copy / countdown / no invented prices | Implemented; visual check follows build |
| Server Open House phases (locked / referral early / open / member always) | Unit-tested against America/Chicago wall times |
| Referral validation does not distinguish used vs unknown | Same generic failure for expired / revoked / exhausted / unknown |
| Matching never invents profiles; cap 10; declined hidden | Unit-tested |
| Stripe / Stream / Resend / Supabase absent → stubs | Health payload + route stubs |
| No production deploy | Not performed |

## How to review the UI without waiting for the tenth

1. `npm run dev`
2. Open `/` — cinematic lock screen
3. Reviewer tools (preview only): **Preview as member**, **Preview as admin**, **Force Open House cookie**
4. TEST-ONLY referral: `TENTH-EARLY` (early access when the window is in the 9:00 hour, or any Open House session)
5. `TENTH-EXPIRED` and `TENTH-REVOKED` must fail like an unknown code

## Runtime limitations

- No live Supabase session store; preview roles are signed cookies (`PREVIEW_DEMO_AUTH`)
- Open House force cookie and env override are preview-only and must be disabled in production
- In-memory rate limits reset on cold start
- Stream compose does not persist; DEMO messages only
- Stripe Checkout returns 501 until approved Price IDs exist — by design
- Storage migration may need dashboard confirmation
- Semantic layer without `OPENAI_API_KEY` is a lexical stub, not a hosted model
- Camera QR scan is not implemented; paste / `/referral/[code]` / SVG QR are
- Legal pages are placeholders
- Browser walkthrough of every member tab is performed after `next build` / `next start` in this environment when available

## Not verified

- Live Stripe webhook signatures against Stripe CLI
- Live Stream moderation
- Live Resend domain sending
- pgvector performance
- Production RLS with real Auth users
- Physical Open House operations
