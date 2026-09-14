# 10th Meridian

**The people you should know next.**

A private, invitation-only network built around relevance, trust, contribution, and the belief that the right relationship can change everything.

This repository is a **reviewable foundation** — not a production launch. Do not deploy or publish live membership prices.

## Stack

- Next.js 16 (App Router) + TypeScript, mobile-first
- Vercel-ready (this PR does **not** deploy)
- Supabase (Auth, Postgres, Storage) — schema + stubs
- Stripe Billing — hosted Checkout / Portal stubs, webhook handler
- Stream Chat — token + member Channels UI scaffolding
- Resend — transactional templates
- Hybrid **Meridian Index** matching in TypeScript + Postgres functions

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

No live secrets are required. Preview mode uses labeled SYNTHETIC DEMO data.

The lock screen is the default outside the monthly Open House window (the 10th, America/Chicago). Use the discreet **Reviewer tools** (shown only when `NEXT_PUBLIC_PREVIEW_TOOLS=true`) to:

- Preview as member / steward / approved-unpaid
- Force Open House open for a walkthrough

Or set `OPEN_HOUSE_FORCE=open` in `.env.local`.

```bash
npm run build    # production build
npm test         # matching, Open House clock, preview store
```

## What this PR includes

1. Original 10th Meridian identity and cinematic lock / Open House surfaces
2. Server-side Open House gating (never the client clock)
3. Application wizard, reminders, referral codes + camera QR with paste fallback
4. Member product: Home, Matches (feedback + intros), directory filters + profiles, onboarding, Channels (DEMO compose/threads/reactions), Events register/waitlist, Billing CTA
5. Meridian 10 / 100 hybrid matching (structured + complementarity + diversity + feedback + curation; embeddings pluggable)
6. Actionable admin: admissions cap + override log, live weights, Open House schedule, referral issue/revoke, curated promote/suppress
7. SQL migrations, `.env.example`, `SETUP.md`, `TEST_REPORT.md`

## Reviewer click-through (Wave 2)

1. `/` lock screen (only public face outside the tenth)
2. Reviewer tools → **Force Open House** → read philosophy / Index / scarcity / placeholders → **Walk the DEMO house**
3. Matches: Relevant / Not relevant, Request introduction
4. Members: filter, open a profile, Message / Introduce
5. Channels: drawer, thread, react, compose
6. Events: open a listing, register (still labeled planned/concept)
7. Reviewer tools → **Approved — payment pending** → Billing CTA (501 without price IDs)
8. Reviewer tools → **Preview as admin** → approve against the cap, edit weights, issue/revoke a code, curate a match

## Do not

- Invent membership prices
- Copy another network’s name, copy, photographs, or logo
- Present DEMO people or events as real
- Deploy this branch to production from the PR

See [SETUP.md](./SETUP.md) for remaining credentials, prices, assets, and policy decisions.
