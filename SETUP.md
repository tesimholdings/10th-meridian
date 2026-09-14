# 10th Meridian — remaining setup checklist

This foundation boots in preview without live secrets. Nothing below should be guessed into the product.

Wave 2 added interactive member/admin DEMO state (in-process store). It resets when the Node process restarts. Persist to Supabase before any real steward uses it.

## 1. Hosting (Vercel) — do not deploy from this PR

- [ ] Create a Vercel project linked to this GitHub repo (Preview deployments only)
- [ ] Confirm Production is **not** promoted until legal, prices, and assets are approved
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the preview URL. Planned live origin: `https://tenmeridian.com` (not purchased; do not buy or attach in Vercel production yet)
- [ ] Attach `tenmeridian.com` only after the domain is purchased and Open House / lock behavior is accepted
- [ ] Keep `NEXT_PUBLIC_PREVIEW_TOOLS=false` and `PREVIEW_DEMO_AUTH=false` in Production
- [ ] Set `NEXT_PUBLIC_RUNTIME_MODE=live` only after integrations are real
- [ ] Rotate `SESSION_SECRET` before any shared preview URL is circulated

## 2. Supabase

- [ ] Create a Supabase project
- [ ] Apply `supabase/migrations/0001_init.sql` through `0007_lifetime_pricing.sql` (SQL editor or CLI)
- [ ] Confirm `pgcrypto` is available; decide whether to enable `vector` later
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configure Auth: email magic link / password, site URL, redirect to `/api/auth/callback`
- [ ] Create Storage buckets if the migration cannot (dashboard fallback): `avatars`, `channel-attachments`, `event-media`
- [ ] Review RLS policies with a steward account before inviting anyone real
- [ ] Replace DEMO seed referrals before going live
- [ ] Decide backup / PITR
- [ ] Wire `accounts.user_id` on first successful Auth login

## 3. Stripe Billing

- [ ] Create a Stripe account (test mode first)
- [x] Approved public price: **Lifetime Membership, $10,000, one time**
- [ ] Create a Stripe Product + **one-time** Price for $10,000 (not a subscription)
- [ ] Paste the Price ID into `STRIPE_LIFETIME_PRICE_ID` and `site_config.stripe_lifetime_price_id`
- [ ] Organization / Strategic Partnership remains by application — no public price
- [ ] Monthly billing will come later — do not add a monthly product to the public pricing section yet
- [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Webhook endpoint `/api/stripe/webhook` for `checkout.session.completed` (Lifetime is payment-mode). Keep subscription events for a later monthly product
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Enable Customer Portal (invoices / receipts)
- [ ] Optional event payments: per-event Price IDs on `events.stripe_price_id`

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

- [ ] Authenticate a sending domain
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- [ ] Review HTML stubs in `src/lib/resend/templates.ts` with counsel/brand
- [ ] `ADMIN_NOTIFICATION_EMAIL` for steward copies
- [ ] Preview templates at `/api/email/preview?type=doorsReminder` only while preview tools are on

## 6. Open House & admissions (admin decisions)

- [ ] Confirm Open House uses the visitor’s IANA timezone (browser `tm_tz`); server clock evaluates 10:00–22:00 local on the 10th
- [ ] Confirm fallback timezone when the visitor zone is unknown (`America/Chicago` / `OPEN_HOUSE_TIMEZONE`)
- [ ] Confirm referral early hour stays 09:00 local (1 hour before general) in that same timezone
- [ ] Confirm day-of-month (default 10; schema caps 1–28)
- [ ] Confirm monthly cap remains 10; override policy for stewards
- [ ] Confirm waitlist vs next-cohort movement when the cap is reached
- [ ] Confirm whether Open House DEMO ever includes a physical address
- [ ] Persist schedule in `site_config` so env is not the only source
- [ ] Remove `OPEN_HOUSE_FORCE` from every non-local environment

## 7. Referrals

- [ ] Issue production codes (never reuse `TENTH-EARLY` outside preview)
- [ ] Set max uses, expiration, and revoke policy
- [x] Original referral card + QR: `/referral/{code}/card` (print / save PDF). Steward desk has a Print card link
- [ ] Issue production cards from that view only (original mark, sailor-gold palette)
- [ ] Rate limits: tune `RATE_LIMIT_MAX_REFERRAL_CHECKS`
- [ ] Attribution display rules for “Referred Applicant”
- [ ] Audit retention

## 8. Matching (Meridian Index)

- [ ] Confirm initial weights (30 / 25 / 15 / 10 / 5 / 5 / 10)
- [ ] Confirm Crossings travel weights (40 / 25 / 15 / 10 / 10) in `travel_match_weights`
- [ ] Decide embedding provider (`stub` vs `openai`) and `OPENAI_API_KEY`
- [ ] Optional: migrate `profiles.embedding` jsonb → pgvector
- [ ] Schedule `recalculate_matches_for` after profile edits (cron / trigger)
- [ ] Steward training: promote / suppress with a written reason
- [ ] Confirm protected traits remain excluded forever
- [ ] Cache TTL for mobile rankings

## 9. Assets (REPLACE)

- [ ] Commission or license a cinematic harbor-water hero film (portrait + widescreen)
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
- [ ] Cookie / analytics decision (none shipped)
- [ ] Data processing addenda: Supabase, Stripe, Stream, Resend, Vercel

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

- [x] Lifetime amount: $10,000 one-time (shown in UI)
- [ ] Stripe one-time Lifetime Price ID + keys (checkout remains stubbed)
- [ ] Hero film to replace the labeled harbor-water placeholder
- [ ] Purchase **tenmeridian.com** when ready — do not attach production domain yet
- [ ] Live Supabase / Stream / Resend keys (build and tests must not require them)
- [ ] Counsel-approved legal pages
- [ ] Persist preview store mutations into Supabase (`site_config`, weights, admissions, referrals)
- [ ] Monthly billing product (later — not in the public pricing section yet)

## Environment map

See `.env.example` for every variable, its purpose, and safe defaults.

Crossings adds **no new environment variables**. Calendar v1 is `.ics` download only — do not block on OAuth.
