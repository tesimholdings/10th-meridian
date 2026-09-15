# TEST_REPORT — Live stack wiring

Date: 2026-09-15  
Branch: `cursor/live-stack-wiring-4a1b`  
Base: `cursor/audit-reliability-f75b`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

Review-only. Does not merge. Does not promote Production. Does not purchase domain or Stripe products. No invented API secrets.

## Checks

| Check | Result |
| --- | --- |
| `npm test` | 141/141 pass |
| `npm run build` | Green — Next.js 16.3.5, TypeScript clean |
| `npm run lint` | No new errors on live-stack files. Base branch still fails pre-existing `react-hooks/set-state-in-effect` in channel-app / apply-wizard / crossings-flight / ask-meridian / member-header |

## Automated (this wave)

Added coverage for env from-address + integration flags, Resend stub helpers, Stream channel/token stubs, Stripe lifetime Checkout stub (never charges), PostHog no-op, Sentry placeholders (PR #12 not landed), hybrid matching fallback, Supabase unconfigured fallback.

## Demo-safe behavior

| Integration | Missing env | Behavior |
| --- | --- | --- |
| Resend | `RESEND_API_KEY` | Apply / reminder / invite return `{ stub: true }` |
| Stripe | `STRIPE_SECRET_KEY` or `STRIPE_PRICE_ID` | Checkout 501, webhook stub, nothing charged |
| Stream | `STREAM_API_SECRET` | Token `{ stub: true, token: null }` |
| Supabase | public URL/anon | Auth + matching stay on preview store |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY` | `PostHogInit` is a no-op |
| Sentry | DSN | Placeholders only — SDK not duplicated |

# TEST_REPORT — Referral Rewards

Date: 2026-09-15  
Branch: `cursor/referral-rewards-4914`  
Base: `cursor/astra-audit-fixes-e546`

Adds unit coverage for points math (10 pts = $1,000), reserve locking, admission → +10 pts once, catalog unlock thresholds, named demo members, and My Circle copy (`src/lib/rewards/math.test.ts`, `src/lib/rewards/actions.test.ts`, `src/lib/data/demo.test.ts`, preview-store admission hook).

# TEST_REPORT — Astra audit redesign

Date: 2026-09-14  
Branch: `cursor/astra-audit-fixes-e546`  
Base: `cursor/profiles-network-openhouse-2de8`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | 78/78 pass — prior coverage plus campaign PNGs on disk, slot mapping (nightlife not default), Ask, DM destination, journey validation |
| `npm run lint` | Pass (0 errors) |
| `npm run build` | Pass — Next.js 16.3.5 Turbopack, TypeScript clean |

## Product coverage (this wave)

- Open House 10:00–22:00 in the **provided IANA timezone**; referral 09:00 local; fallback `America/Chicago`
- Lock-screen countdown uses the same `evaluateOpenHouse` `nextOpenAt`
- Profiles: gallery (Storage stub + DEMO), optional website/LinkedIn, privacy, in-common, upcoming events
- Your Circle add/remove; Remove from For you; hide/block still respected
- House notifications + in-app/email/digest prefs
- DMs from profile / My Circle / Members (Stream when keys exist; DEMO otherwise; not E2EE)
- Community: Absolutely no soliciting. Ban with no refund.
- Bottom nav: Home · My Circle · Messages · Crossings · Profile
- UI vibe: warm white / navy / ocean blue / restrained gold; editorial campaign PNGs in-repo (yacht wake, deck, dinner, salon, terrace, coastal plaza); nightlife still only when listed; reduced-motion honored

## Privacy

Profiles are never public or indexed. Open House walkthrough is SYNTHETIC DEMO only. City-level location only. Optional fields honor privacy flags.

## Runtime limitations

- Preview store is in-process and resets on server restart
- Stream compose is DEMO unless keys exist; not E2EE
- Gallery uploads are a Storage stub
- Calendar v1 is `.ics` download — no external calendar OAuth
- No production deploy
- Domain `tenmeridian.com` is prepared, not purchased

## Still Stefan’s

Hero film, live keys, counsel-approved legal pages, Stripe lifetime Price ID.
