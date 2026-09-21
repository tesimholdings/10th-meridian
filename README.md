# 10th Meridian

**The people you should know next.**

A private, invitation-only network built around relevance, trust, contribution, and the belief that the right relationship can change everything.

This repository is a **reviewable foundation** — not a production launch. Do not deploy or publish live membership except the approved Founding Ten / Standard amounts.

This wave wires the **live stack** (Resend, Supabase, Stream Chat, Stripe Checkout, Meridian 10/100 matching, PostHog) on top of the audit-reliability tip — official lockup everywhere, Crossings plane, liquid UI, and audit P1s preserved. Demo-safe when env is missing. Bottom nav stays Home · **My Circle** · Messages · Crossings · Profile.

## Stack

- Next.js 16 (App Router) + TypeScript, mobile-first
- Vercel-ready (this PR does **not** deploy or promote Production)
- Supabase (Auth, Postgres, Storage) — client/server helpers + schema through `0009_stripe_membership.sql`
- Stripe Billing — Founding Ten $5,000 one-time; after that $10,000 entry + $195/month (never charges without keys)
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

The lock screen is the default outside the monthly Open House window (the 10th, **visitor local timezone**, fallback `America/Chicago`). The closed lock always shows an empty **username / email** field. Continue reveals **password** and **Forgot password**. **Have a referral code?** is on the same screen. Use the discreet **Reviewer tools** (shown only when `NEXT_PUBLIC_PREVIEW_TOOLS=true`) to:

- Preview as member / steward / approved-unpaid
- Force Open House open for a walkthrough

Or set `OPEN_HOUSE_FORCE=open` in `.env.local`.

Preview demo (no live passwords): with `PREVIEW_DEMO_AUTH=true` and no Supabase Auth, enter a demo alias (`stefan`, `voss`, `ricky`, or `steward`) → Continue → Enter. Referral sample: `TENTH-EARLY`. Production should keep `PREVIEW_DEMO_AUTH=false` (no demo sessions); the lock fields stay visible and password goes to Supabase Auth when env is set.

```bash
npm run build    # production build
npm test         # My Circle, Open House TZ, Circle, privacy, notifications, copy, Referral Rewards
```

## Reviewer click path (live stack)

No live secrets required. Missing env = labeled demo.

1. `/` lock — official closed-lock lockup on the grainy black-and-gold field (no campaign photo). Username/email → Continue → password + Forgot password, or **Have a referral code?**
2. Reviewer tools (bottom-right, preview only) → **Force Open House** → `/open-house`
3. **Remind me** on the lock → `/api/reminders` stubs Resend (`EMAIL_FROM=team@tenmeridian.com`) until `RESEND_API_KEY` is set
4. Apply during Open House → `/api/applications` sends **application received** (stub without key)
5. Reviewer tools → **Approved — payment pending** → `/member/billing` → **Continue to Stripe Checkout**
   - Without keys: HTTP 501, nothing charged
   - With TEST keys: Founding Ten uses `mode=payment` ($5,000). After that / rejoin: `mode=subscription` ($10,000 entry + $195/month)
6. `/member/circle` — Meridian **10 → 100** (never “Matches”). Hybrid TS scoring; Postgres persist when service role exists
7. `/member/messages` — DMs + Channels. Stream token at `POST /api/stream/token` (stub without keys). Phone alerts register only when those keys are live (`/api/stream/push`). Steward seed: `POST /api/stream/seed`
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
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Phone alerts | VAPID public key. Empty = no Web Push |
| `WEB_PUSH_PRIVATE_KEY` | Phone alerts | VAPID private key. Server only. Never commit |
| `WEB_PUSH_SUBJECT` | No | Default `mailto:team@tenmeridian.com` |
| `STREAM_FIREBASE_PUSH` | No | `true` only after Stream Dashboard Firebase matches this web certificate |
| `STREAM_PUSH_PROVIDER_NAME` | No | Stream multi-bundle provider name. Default `firebase` |
| `STRIPE_SECRET_KEY` | Billing | Stripe TEST secret — never charge without this |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks | Signature verification |
| `STRIPE_PRICE_FOUNDING_ENTRY` | Billing | Founding Ten **$5,000** one-time (`price_1UG1eB3QQyESIKbfGysIcPYf`) |
| `STRIPE_PRICE_STANDARD_ENTRY` | Billing | Standard **$10,000** one-time entry (`price_1UG1eC3QQyESIKbfKbIfpHct`) |
| `STRIPE_PRICE_MONTHLY` | Billing | Standard **$195/month** (`price_1UG1eD3QQyESIKbfZJOuoyS6`) |
| `STRIPE_FOUNDING_PRICE_ID` | No | Alias for `STRIPE_PRICE_FOUNDING_ENTRY` |
| `STRIPE_STANDARD_PRICE_ID` | No | Alias for `STRIPE_PRICE_STANDARD_ENTRY` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing UI | Publishable key |
| `STRIPE_PRICE_ID` / `STRIPE_LIFETIME_PRICE_ID` | No | **Retired.** Archived lifetime Price — do not use |
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

Create Stripe Prices in TEST only (Dashboard). Do not invent amounts in code. Do not use the archived lifetime Price. No promotion codes.

See [docs/STRIPE.md](./docs/STRIPE.md). Social OAuth is **not** built. Apply migrations `0001`–`0009`. Matching algorithm: [docs/MATCHING.md](./docs/MATCHING.md).

## What this PR includes

1. Original 10th Meridian identity and cinematic lock / Open House surfaces
2. Server-side Open House gating in the **visitor IANA timezone** (10:00–22:00 local; referral 09:00)
3. Application wizard, reminders, referral codes + camera QR with paste fallback
4. Member product: Home, **My Circle** (never “Matches”), Your Circle, Ask the Meridian, directory + rich profiles, Messages (DMs + Channels), Crossings, Events, Billing
5. Meridian 10 / 100 hybrid matching (structured + complementarity + diversity + feedback + curation)
6. Actionable admin: admissions cap + override log, live weights, Open House schedule, referral issue/revoke, curated promote/suppress
7. SQL migrations through `0009_stripe_membership.sql`, `.env.example`, `SETUP.md`, [docs/MATCHING.md](./docs/MATCHING.md), [docs/STRIPE.md](./docs/STRIPE.md)
8. **Crossings** — Set Your Coordinates, A Crossing, Open a Table, City Hosts, City Notes
9. Notifications center + preferences; community standard: absolutely no soliciting
10. Approved **Founding Ten $5,000**; after that **$10,000 + $195/month**. No discounts. Domain prep **tenmeridian.com** (not purchased)

## Reviewer click-through (Stefan / Astra)

1. `/` lock — grainy black-and-gold field only (no campaign/yacht photo), **centered** wordmark + headline + countdown + username/email entry + **Remind me**. Sign in remains on Open House, not on the lock.
2. Desktop (fine pointer): gold/navy cursor follower. Off for touch. Off / static when `prefers-reduced-motion`
3. Reviewer tools → **Force Open House** → `/open-house` hero, The House, Experiences, **Founding Ten. $5,000.**, no-soliciting → **Explore the house**
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

- Invent membership amounts — use Founding Ten **$5,000** and Standard **$10,000 + $195/month**
- Use coupons or referral discounts that change what a member pays
- Copy another network’s name, copy, photographs, or logo
- Present DEMO people or events as real
- Deploy this branch to production from the PR
- Call My Circle “Matches” or “Index” in the primary nav

See [SETUP.md](./SETUP.md) for remaining credentials, prices, assets, and policy decisions.
