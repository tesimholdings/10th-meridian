# 10th Meridian — remaining setup checklist

This foundation boots in preview without live secrets. Nothing below should be guessed into the product.

Wave 2 added interactive member/admin DEMO state (in-process store). It resets when the Node process restarts. Persist to Supabase before any real steward uses it.

## 1. Hosting (Vercel) — do not deploy from this PR

- [ ] Create a Vercel project linked to this GitHub repo (Preview deployments only)
- [ ] Confirm Production is **not** promoted until legal, prices, and assets are approved
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the preview URL, then later the custom domain
- [ ] Prepared domain: **tenmeridian.com** (not purchased). Do not attach until bought and Open House / lock behavior is accepted
- [ ] Attach the custom domain only after Open House / lock behavior is accepted
- [ ] Keep `NEXT_PUBLIC_PREVIEW_TOOLS=false` and `PREVIEW_DEMO_AUTH=false` in Production
- [x] Closed lock always shows username → password (Forgot password) or a referral path. `PREVIEW_DEMO_AUTH=false` only disables demo sessions; it must not hide the entry fields. Password submit calls Supabase Auth `signInWithPassword` when env is set. Preview without Auth: demo aliases (`stefan`, `voss`, `steward`) then Enter; sample referral `TENTH-EARLY`. Never invent live passwords.
- [ ] Create the two real members (no password in git). Set `BOOTSTRAP_MEMBER_PASSWORD` out of band, apply migration `0010`, then either `npm run bootstrap:members` or POST `/api/auth/bootstrap-members` with `BOOTSTRAP_MEMBERS_ENABLED=true` and `Authorization: Bearer $BOOTSTRAP_MEMBER_TOKEN`. That creates `stefanfulks@tenmeridian.com` (steward / `administrator`) and `rickydelvalle@tenmeridian.com` (`member`), confirms email, writes `user_metadata.username` + `name`, and upserts account, profile, and Stream users. Turn `BOOTSTRAP_MEMBERS_ENABLED` off afterward. Re-runs do not reset the password unless `BOOTSTRAP_RESET_PASSWORD=true`.
- [ ] Set `NEXT_PUBLIC_RUNTIME_MODE=live` only after integrations are real
- [ ] Rotate `SESSION_SECRET` before any shared preview URL is circulated

## 2. Supabase

- [ ] Create a Supabase project
- [ ] Apply `supabase/migrations/0001_init.sql` through `0010_member_usernames.sql` (SQL editor or CLI)
- [ ] `0010_member_usernames.sql` adds `accounts.username`, `profiles.username`, and `profiles.role`. Required before username sign-in can read the column. Auth metadata still resolves `stefanfulks` / `rickydelvalle` if the migration is not applied yet.
- [ ] Confirm `pgcrypto` is available; decide whether to enable `vector` later
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configure Auth: email magic link / password, site URL, redirect to `/api/auth/callback`
- [ ] Create Storage buckets if the migration cannot (dashboard fallback): `avatars`, `channel-attachments`, `event-media`, `portfolio`
- [ ] Review RLS policies with a steward account before inviting anyone real
- [ ] Replace DEMO seed referrals before going live
- [ ] Decide backup / PITR
- [ ] Wire `accounts.user_id` on first successful Auth login

## 3. Stripe Billing

- [ ] Create a Stripe account (test mode first)
- [x] **Founding Ten:** $5,000 one-time, first 10 members, no discounts.
- [x] **After Founding Ten:** $10,000 one-time entry + $195/month. Cancel dues → seat ends. Rejoin = $10,000 again.
- [x] TEST catalog (acct_1UG1Kk3QQyESIKbf): founding `price_1UG1eB3QQyESIKbfGysIcPYf`, entry `price_1UG1eC3QQyESIKbfKbIfpHct`, monthly `price_1UG1eD3QQyESIKbfZJOuoyS6`
- [ ] Paste those IDs into Preview: `STRIPE_PRICE_FOUNDING_ENTRY`, `STRIPE_PRICE_STANDARD_ENTRY`, `STRIPE_PRICE_MONTHLY`
- [ ] Organization / Strategic Partnership remains by application — no public price
- [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Webhook endpoint `/api/stripe/webhook` for `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Enable Customer Portal for invoices / Standard dues — not a lifetime product
- [ ] Do **not** use archived lifetime Price `price_1UG1Xg3QQyESIKbfV5BfJF6U`
- [ ] Do **not** enable promotion codes or referral price changes

See [docs/STRIPE.md](./docs/STRIPE.md).

## 4. Stream Chat

- [ ] Create a Stream app
- [ ] `NEXT_PUBLIC_STREAM_API_KEY`, `STREAM_API_SECRET`
- [ ] Seed channels: announcements, introductions, ask-and-offer, opportunities, events, travel, ideas
- [ ] Crossing DMs and table channels: Stream path when keys exist; DEMO compose otherwise
- [ ] Server-side permissions for every message and attachment
- [ ] Moderation / block / report hooks
- [ ] Push / email notification settings
- [ ] Do not describe the product as E2EE

## 5. Resend

- [ ] Authenticate sending domain **tenmeridian.com** (prepared, not purchased)
- [ ] `RESEND_API_KEY`, `EMAIL_FROM=team@tenmeridian.com` (`RESEND_FROM_EMAIL` is an alias)
- [ ] Review HTML stubs in `src/lib/resend/templates.ts` with counsel/brand
- [ ] `ADMIN_NOTIFICATION_EMAIL` for steward copies
- [ ] Preview templates at `/api/email/preview?type=doorsReminder` only while preview tools are on

## 6. Open House & admissions (admin decisions)

- [x] Visitor window is 10:00–22:00 in the visitor IANA timezone (cookie / `x-visitor-timezone`). Referral early 09:00 local the same day. Fallback `America/Chicago`.
- [ ] Confirm day-of-month (default 10; schema caps 1–28)
- [ ] Confirm monthly cap remains 10; override policy for stewards
- [ ] Confirm waitlist vs next-cohort movement when the cap is reached
- [ ] Confirm whether Open House DEMO ever includes a physical address
- [ ] Persist schedule in `site_config` so env is not the only source
- [ ] Remove `OPEN_HOUSE_FORCE` from every non-local environment

## 7. Referrals

- [ ] Issue production codes (never reuse `TENTH-EARLY` outside preview)
- [ ] Set max uses, expiration, and revoke policy
- [ ] Decide QR print / card design (original 10th Meridian mark only)
- [ ] Rate limits: tune `RATE_LIMIT_MAX_REFERRAL_CHECKS`
- [ ] Attribution display rules for “Referred Applicant”
- [ ] Audit retention

## 8. Matching (Meridian Index)

See [docs/MATCHING.md](./docs/MATCHING.md) for the algorithm (compatibility, complementarity, diversity, weights, Meridian 10 / 100).

- [ ] Confirm initial weights (30 / 25 / 15 / 10 / 5 / 5 / 10)
- [ ] Confirm Crossings travel weights (40 / 25 / 15 / 10 / 10) in `travel_match_weights`
- [ ] Decide embedding provider (`stub` vs `openai`) and `OPENAI_API_KEY`
- [ ] Optional: migrate `profiles.embedding` jsonb → pgvector
- [ ] Schedule `recalculate_matches_for` after profile edits (cron / trigger)
- [ ] Steward training: promote / suppress with a written reason
- [ ] Confirm protected traits remain excluded forever
- [ ] Cache TTL for mobile rankings

## 9. Assets (REPLACE)

- [ ] Commission or license a cinematic night-water hero film (portrait + widescreen)
- [ ] Compress, poster frames, lazy-load; keep Pause + reduced-motion
- [ ] Replace `/public/media/hero-poster.svg`
- [ ] Final wordmark / compass lockup from the SVG mark in `src/components/brand/mark.tsx`
- [ ] No unlicensed stock. No real member photographs without written consent
- [ ] Event photography policy

## 10. Legal / policy placeholders to replace

- [ ] Privacy (`/legal/privacy`)
- [ ] Terms (`/legal/terms`)
- [ ] Refund & cancellation (`/legal/refund`)
- [ ] Community standards (`/legal/community`)
- [ ] Cookie / analytics decision (PostHog ships behind `NEXT_PUBLIC_POSTHOG_KEY`; no-op without it)
- [ ] Data processing addenda: Supabase, Stripe, Stream, Resend, PostHog, Sentry, Vercel
- [ ] Sentry: rebase/merge PR #12 when it lands; this branch only documents DSN placeholders

## 11. Content & operations

- [ ] Editorial resources library
- [ ] First real (or clearly planned) experiences — never mark fictional events as completed
- [ ] Steward roster and on-call for the tenth
- [ ] Application review workflow owners
- [ ] Crisis / abuse escalation
- [ ] Backup steward for admissions cap overrides

## 12. Security before any real member

- [ ] Disable preview tools and demo auth
- [ ] Rotate all secrets
- [ ] Confirm RLS with a non-staff test user
- [ ] Attachment MIME / size validation on live Storage
- [ ] Replace in-memory rate limits with Redis/Upstash
- [ ] Production error reporting (without leaking applicant data)
- [ ] Confirm `X-Robots-Tag` on `/member` and `/admin`
- [ ] Suspend / expire → revoke Stream + Stripe access job

## Still needs Stefan

- [x] Founding Ten $5,000; after that $10,000 entry + $195/month. No discounts. Archived lifetime Price unused.
- [ ] Hero film to replace the labeled cinematic placeholder
- [ ] Live Supabase / Stripe / Stream / Resend keys (build and tests must not require them)
- [ ] Counsel-approved legal pages
- [ ] Persist preview store mutations into Supabase (`site_config`, weights, admissions, referrals)

## Environment map

See `.env.example` and the README Vercel env checklist for every variable, its purpose, and safe defaults.

Crossings adds **no new environment variables**. Calendar v1 is `.ics` download only — do not block on OAuth. Social OAuth is not built.

## Stripe Prices (TEST)

See [docs/STRIPE.md](./docs/STRIPE.md). Founding `price_1UG1eB3QQyESIKbfGysIcPYf`, Standard entry `price_1UG1eC3QQyESIKbfKbIfpHct`, monthly `price_1UG1eD3QQyESIKbfZJOuoyS6`. Do not use archived lifetime Price `price_1UG1Xg3QQyESIKbfV5BfJF6U`. Do not enable livemode from this PR.

## PostHog

Paste `NEXT_PUBLIC_POSTHOG_KEY` (and optional `NEXT_PUBLIC_POSTHOG_HOST`) on Preview only. Empty key = no init, no cookies, no network.
