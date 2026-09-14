# 10th Meridian — remaining setup checklist

This foundation boots in preview without live secrets. Nothing below should be guessed into the product.

Wave 2 added interactive member/admin DEMO state (in-process store). It resets when the Node process restarts. Persist to Supabase before any real steward uses it.

## 1. Hosting (Vercel) — do not deploy from this PR

- [ ] Create a Vercel project linked to this GitHub repo (Preview deployments only)
- [ ] Confirm Production is **not** promoted until legal, prices, and assets are approved
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the preview URL, then later the custom domain
- [ ] Attach the custom domain only after Open House / lock behavior is accepted
- [ ] Keep `NEXT_PUBLIC_PREVIEW_TOOLS=false` and `PREVIEW_DEMO_AUTH=false` in Production
- [ ] Set `NEXT_PUBLIC_RUNTIME_MODE=live` only after integrations are real
- [ ] Rotate `SESSION_SECRET` before any shared preview URL is circulated

## 2. Supabase

- [ ] Create a Supabase project
- [ ] Apply `supabase/migrations/0001_init.sql` through `0007_help_asks.sql` (SQL editor or CLI)
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
- [ ] **Do not invent prices.** Obtain approved Founding and Standard amounts
- [ ] Replace `[INSERT APPROVED FOUNDING PRICE]` and `[INSERT APPROVED STANDARD PRICE]` only after approval
- [ ] Create Stripe Products + Prices; paste IDs into `STRIPE_FOUNDING_PRICE_ID` / `STRIPE_STANDARD_PRICE_ID` and `site_config`
- [ ] Organization / Strategic Partnership remains by application — no public price
- [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Webhook endpoint `/api/stripe/webhook` for `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Enable Customer Portal (cancellation / invoices) — copy still placeholder
- [ ] Optional event payments: per-event Price IDs on `events.stripe_price_id`
- [ ] Confirm founding preferential rate rules while continuously active (finance + counsel)

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

- [ ] Confirm timezone (default `America/Chicago`) and hours (9 / 10 / 22)
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

- [ ] Confirm initial weights (30 / 25 / 15 / 10 / 5 / 5 / 10)
- [ ] Confirm Crossings travel weights (40 / 25 / 15 / 10 / 10) in `travel_match_weights`
- [ ] Confirm Ask the Meridian weights (45 / 20 / 12 / 10 / 8 / 5) in `ask_match_weights`
- [ ] Decide embedding provider (`stub` vs `openai`) and `OPENAI_API_KEY`
- [ ] Optional: migrate `profiles.embedding` jsonb → pgvector
- [ ] Schedule `recalculate_matches_for` after profile edits (cron / trigger)
- [ ] Schedule `recalculate_help_ask` after a new ask
- [ ] Steward training: promote / suppress with a written reason
- [ ] Confirm protected traits remain excluded forever
- [ ] Cache TTL for mobile rankings (Index + Ask; a new ask always recalculates)

### Ask the Meridian defaults (`ask_match_weights`)

| Pillar | Default | Role |
| --- | --- | --- |
| Complementary | 0.45 | Their offers/strengths versus the stated need |
| Meridian | 0.20 | Existing Index pair compatibility |
| Industry | 0.12 | Asked industry vs theirs |
| Geography | 0.10 | Asked place vs city / travel |
| Availability | 0.08 | Open / selective / limited |
| Semantic | 0.05 | Lexical stub or optional embedding |

Ask the Meridian is hybrid (structured parse + complementarity + Index + filters). It is not a “find similar people” prompt. Member UI calls the result **Who can help** / the **Index**, never “matches.” Relevant / not relevant feeds the behavioral layer (`help_ask_feedback` and Index `match_feedback`). House prompts do not solicit. Open House sees SYNTHETIC DEMO profiles only. RLS on `help_asks` / scores / feedback is members-only.

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

## Still needs Stefan (Wave 2)

- [ ] Approved Founding / Standard amounts (placeholders remain)
- [ ] Hero film to replace the labeled cinematic placeholder
- [ ] Live Supabase / Stripe / Stream / Resend keys (build and tests must not require them)
- [ ] Counsel-approved legal pages
- [ ] Persist preview store mutations into Supabase (`site_config`, weights, admissions, referrals)

## Environment map

See `.env.example` for every variable, its purpose, and safe defaults.

Crossings adds **no new environment variables**. Calendar v1 is `.ics` download only — do not block on OAuth.
