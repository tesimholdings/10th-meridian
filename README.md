# 10th Meridian

**The people you should know next.**

A private, invitation-only network built around relevance, trust, contribution, and the belief that the right relationship can change everything.

This repository is a **reviewable foundation** — not a production launch. Do not deploy or publish live membership except the approved lifetime amount.

This wave wires the **live stack** (Resend, Supabase, Stream Chat, Stripe lifetime Checkout, Meridian 10/100 matching, PostHog) on top of the audit-reliability tip — official lockup everywhere, Crossings plane, liquid UI, and audit P1s preserved. Demo-safe when env is missing. Bottom nav stays Home · **My Circle** · Messages · Crossings · Profile.

## Stack

- Next.js 16 (App Router) + TypeScript, mobile-first
- Vercel-ready (this PR does **not** deploy or promote Production)
- Supabase (Auth, Postgres, Storage) — client/server helpers + schema through `0008_live_stack.sql`
- Stripe Billing — $10,000 lifetime one-time Checkout + webhook stub (never charges without keys)
- Stream Chat — server/client token helpers for DMs and Channels
- Resend — apply received, Open House reminder, invite (`team@tenmeridian.com`)
- Hybrid **Meridian 10 / 100** matching in TypeScript + Postgres
- PostHog — client init behind `NEXT_PUBLIC_POSTHOG_KEY` (no-op without key)
- Sentry — DSN placeholders only; full SDK is PR #12 (not landed)

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

No live secrets are required. Preview mode uses labeled SYNTHETIC DEMO data.

The lock screen is the default outside the monthly Open House window (the 10th, **visitor local timezone**, fallback `America/Chicago`). Use the discreet **Reviewer tools** (shown only when `NEXT_PUBLIC_PREVIEW_TOOLS=true`) to:

- Preview as member / steward / approved-unpaid
- Force Open House open for a walkthrough

Or set `OPEN_HOUSE_FORCE=open` in `.env.local`.

```bash
npm run build    # production build
npm test         # My Circle, Open House TZ, Circle, privacy, notifications, copy, Referral Rewards
```

## Reviewer click path (live stack)

No live secrets required. Missing env = labeled demo.

1. `/` lock — official closed-lock lockup on the grainy black-and-gold field (no campaign photo)
2. Reviewer tools (bottom-right, preview only) → **Force Open House** → `/open-house`
3. **Remind me** on the lock → `/api/reminders` stubs Resend (`EMAIL_FROM=team@tenmeridian.com`) until `RESEND_API_KEY` is set
4. Apply during Open House → `/api/applications` sends **application received** (stub without key)
5. Reviewer tools → **Approved — payment pending** → `/member/billing` → **Continue to Stripe Checkout**
   - Without `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`: HTTP 501, nothing charged
   - With keys: hosted Checkout Session, mode `payment`, lifetime $10,000 Price only
6. `/member/circle` — Meridian **10 → 100** (never “Matches”). Hybrid TS scoring; Postgres persist when service role exists
7. `/member/messages` — DMs + Channels. Stream token at `POST /api/stream/token` (stub without keys)
8. `/api/health` — integration flags (supabase / stripe / stream / resend / posthog / sentry)
9. `/api/email/preview?type=invite` — invite HTML (preview tools only)
10. Legal → Community: **Absolutely no soliciting. Ban with no refund.**

See the longer product walkthrough below.

## Vercel env checklist (Preview only — do not set Production from this PR)

Never commit real secrets. Leave blank to keep demo mode.

| Variable | Required to go live | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Email | Resend API key |
| `EMAIL_FROM` | Email | Default `team@tenmeridian.com` (domain `tenmeridian.com`, not purchased) |
| `RESEND_FROM_EMAIL` | No | Alias for `EMAIL_FROM` |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth/DB | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth/DB | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Matching persist / admin | Service role — server only |
| `NEXT_PUBLIC_STREAM_API_KEY` | Chat | Stream public key |
| `STREAM_API_SECRET` | Chat | Stream server secret |
| `STRIPE_SECRET_KEY` | Billing | Stripe secret — never charge without this |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks | Signature verification |
| `STRIPE_PRICE_ID` | Billing | Approved **$10,000 lifetime one-time** Price (`price_…`) |
| `STRIPE_LIFETIME_PRICE_ID` | No | Alias for `STRIPE_PRICE_ID` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing UI | Publishable key |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics | Client init; **no-op if empty** |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Default `https://us.i.posthog.com` |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | No | Placeholders only until PR #12 lands |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | No | Placeholders only |
| `NEXT_PUBLIC_RUNTIME_MODE` | No | `preview` (default) or `live` |
| `NEXT_PUBLIC_PREVIEW_TOOLS` | No | `true` locally; **false** in Production |
| `PREVIEW_DEMO_AUTH` | No | Demo sign-in; **false** in Production |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` | Links | Public origin; blank on Vercel uses `https://$VERCEL_URL` |
| `OPEN_HOUSE_*` / `ADMISSIONS_MONTHLY_CAP` | No | Visitor-local tenth; cap ≤ 10 |
| `SESSION_SECRET` | Shared preview | Cookie signing |
| `ADMIN_NOTIFICATION_EMAIL` | No | Steward copies |
| `EMBEDDING_PROVIDER` / `OPENAI_API_KEY` | No | Matching semantic boost; default `stub` |

Create the Stripe Price in test mode first (Dashboard → Product → one-time **$10,000** → copy `price_…`). Do not invent an amount in code. Monthly is not a product.

Social OAuth is **not** built. Apply migrations `0001`–`0008`. Matching algorithm: [docs/MATCHING.md](./docs/MATCHING.md).

## What this PR includes

1. Original 10th Meridian identity and cinematic lock / Open House surfaces
2. Server-side Open House gating in the **visitor IANA timezone** (10:00–22:00 local; referral 09:00)
3. Application wizard, reminders, referral codes + camera QR with paste fallback
4. Member product: Home, **My Circle** (never “Matches”), Your Circle, Ask the Meridian, directory + rich profiles, Messages (DMs + Channels), Crossings, Events, Billing
5. Meridian 10 / 100 hybrid matching (structured + complementarity + diversity + feedback + curation)
6. Actionable admin: admissions cap + override log, live weights, Open House schedule, referral issue/revoke, curated promote/suppress
7. SQL migrations through `0008_live_stack.sql`, `.env.example`, `SETUP.md`, [docs/MATCHING.md](./docs/MATCHING.md)
8. **Crossings** — Set Your Coordinates, A Crossing, Open a Table, City Hosts, City Notes
9. Notifications center + preferences; community standard: absolutely no soliciting
10. Approved **lifetime $10,000**. Monthly later — not built. Domain prep **tenmeridian.com** (not purchased)

## Reviewer click-through (Stefan / Astra)

1. `/` lock — grainy black-and-gold field only (no campaign/yacht photo), **centered** wordmark + headline + countdown + **Remind me** on desktop; Sign in in the header
2. Desktop (fine pointer): gold/navy cursor follower. Off for touch. Off / static when `prefers-reduced-motion`
3. Reviewer tools → **Force Open House** → `/open-house` hero, The House, Experiences, **$10,000. Once.**, no-soliciting → **Explore the house**
4. Home — greeting, next trip / experience, three useful connections, Rewards teaser in **points**
5. **My Circle** (`/member/circle`; `/member/index` redirects) — search / Ask; tabs **For you · Your Circle · All members**. For you: Meridian size **10 → 100** (default 10). Your Circle is hand-picked. All members is the directory. Never “Matches”
6. For you — slide from Meridian 10 (immediate ten) toward 100; people enter/leave with motion
7. All members — find **Stefan Fulks** and **Ricky Del Valle** (Founding member badge), plus **Spencer Gilmore**, **Julio Lopez**, **Austin Thorpe**
8. Ask “Chicago introductions” — location-honest reasons, no Lagos-as-Chicago, no filler words
9. Open **P. Adler** → **Message** — conversation header is P. Adler, not Introductions
10. Messages inbox — DMs + Channels, last-message preview, unread; Inbox drawer: Escape + focus trap
11. Notifications — compact rows, timestamps, “added you to their Circle”, Crossing deep-link
12. Crossings — **Add a trip**; empty city/country cannot advance; timezone from destination; requests show person / meeting / dates
13. Own Profile — portrait first, **Referral Rewards** card in points, Edit opens grouped settings
14. Legal → Community: **Absolutely no soliciting. Ban with no refund.**
15. Referral Rewards — `/member/rewards`: **10 pts** seeded (10 pts = $1,000), unlock cards (trip/gold = 10 pts, Founders Circle = 30 pts), reserve gold, request trip credit, submit a referral (Preview: advance → Admitted credits **+10 pts** once)

See [REFERRAL_REWARDS.md](./REFERRAL_REWARDS.md) and [ASTRA_AUDIT_FIXES.md](./ASTRA_AUDIT_FIXES.md).

See [ASTRA_AUDIT_FIXES.md](./ASTRA_AUDIT_FIXES.md).

## Do not

- Invent monthly membership prices
- Copy another network’s name, copy, photographs, or logo
- Present DEMO people or events as real
- Deploy this branch to production from the PR
- Call My Circle “Matches” or “Index” in the primary nav

See [SETUP.md](./SETUP.md) for remaining credentials, prices, assets, and policy decisions.
