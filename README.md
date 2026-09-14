# 10th Meridian

**The people you should know next.**

A private, invitation-only network built around relevance, trust, contribution, and the belief that the right relationship can change everything.

This repository is a **reviewable foundation** — not a production launch. Do not deploy or publish live membership except the approved lifetime amount.

This wave adds **rich profiles**, **Your Circle**, a full **Open House** site, **visitor-local Open House hours**, a **notifications center**, and **direct messages**. Bottom nav: Home · **Index** · Channels · Members · Profile.

## Stack

- Next.js 16 (App Router) + TypeScript, mobile-first
- Vercel-ready (this PR does **not** deploy)
- Supabase (Auth, Postgres, Storage) — schema + stubs
- Stripe Billing — hosted Checkout / Portal stubs, webhook handler (lifetime, one-time)
- Stream Chat — token + member Channels / DM scaffolding
- Resend — transactional templates
- Hybrid **Meridian Index** matching in TypeScript + Postgres functions

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
npm test         # Index, Open House TZ, Circle, privacy, notifications, copy
```

## What this PR includes

1. Original 10th Meridian identity and cinematic lock / Open House surfaces
2. Server-side Open House gating in the **visitor IANA timezone** (10:00–22:00 local; referral 09:00)
3. Application wizard, reminders, referral codes + camera QR with paste fallback
4. Member product: Home, **Index** (never “Matches”), Your Circle, Ask the Meridian, directory + rich profiles, Channels, DMs, Events, Billing
5. Meridian 10 / 100 hybrid matching (structured + complementarity + diversity + feedback + curation)
6. Actionable admin: admissions cap + override log, live weights, Open House schedule, referral issue/revoke, curated promote/suppress
7. SQL migrations through `0007_profiles_network.sql`, `.env.example`, `SETUP.md`, `TEST_REPORT.md`
8. **Crossings** — Set Your Coordinates, A Crossing, Open a Table, City Hosts, City Notes
9. Notifications center + preferences; community standard: absolutely no soliciting
10. Approved **lifetime $10,000**. Monthly later — not built. Domain prep **tenmeridian.com** (not purchased)

## Reviewer click-through (Stefan / Astra)

1. `/` lock screen (only public face outside the tenth). Countdown uses the same visitor-local rules.
2. Reviewer tools → **Force Open House** → read philosophy / who belongs / Index / Ask the Meridian / Crossings / experiences / admissions (10/month) / **$10,000 lifetime** / anti-soliciting → **Walk the DEMO house**
3. Index: Meridian 10 / 100, **Your Circle**, **Ask the Meridian / Who can help**, Relevant / Hide / Request introduction / Message / Add to Circle / Remove from Index
4. Members: filter, open a profile — gallery, bio, city, website/LinkedIn (if visible), in-common, upcoming events, Message / Request introduction / Circle
5. Profile (own): edit, gallery Storage stub, privacy toggles
6. Channels + DM from a profile (Stream stub / DEMO compose). Hint: no soliciting
7. Menu → Notifications → mark read; Settings → house notification prefs
8. Reviewer tools → **Approved — payment pending** → Billing shows **$10,000 lifetime**
9. Legal → Community: **Absolutely no soliciting. Ban with no refund.**
10. Reviewer tools → **Preview as admin** → approve against the cap, edit weights, issue/revoke a code, curate the Index

## Do not

- Invent monthly membership prices
- Copy another network’s name, copy, photographs, or logo
- Present DEMO people or events as real
- Deploy this branch to production from the PR
- Call the Index “Matches”

See [SETUP.md](./SETUP.md) for remaining credentials, prices, assets, and policy decisions.
