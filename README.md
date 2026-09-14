# 10th Meridian

**The people you should know next.**

A private, invitation-only network built around relevance, trust, contribution, and the belief that the right relationship can change everything.

This repository is a **reviewable foundation** — not a production launch. Do not deploy or publish live membership except the approved lifetime amount.

This wave adds **rich profiles**, **Your Circle**, a full **Open House** site, **visitor-local Open House hours**, a **notifications center**, and **direct messages**. Bottom nav: Home · **Index** · Messages · Crossings · Profile.

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
4. Member product: Home, **Index** (never “Matches”), Your Circle, Ask the Meridian, directory + rich profiles, Messages (DMs + Channels), Crossings, Events, Billing
5. Meridian 10 / 100 hybrid matching (structured + complementarity + diversity + feedback + curation)
6. Actionable admin: admissions cap + override log, live weights, Open House schedule, referral issue/revoke, curated promote/suppress
7. SQL migrations through `0007_profiles_network.sql`, `.env.example`, `SETUP.md`, `TEST_REPORT.md`
8. **Crossings** — Set Your Coordinates, A Crossing, Open a Table, City Hosts, City Notes
9. Notifications center + preferences; community standard: absolutely no soliciting
10. Approved **lifetime $10,000**. Monthly later — not built. Domain prep **tenmeridian.com** (not purchased)

## Reviewer click-through (Stefan / Astra)

1. `/` lock — editorial yacht-wake / mobile water hero (not members), short headline, countdown, **Remind me**, Sign in
2. Reviewer tools → **Force Open House** → hero, three benefits, experiences, **$10,000 lifetime**, no-soliciting → **Walk the house**
3. Home — greeting, next trip / experience, three useful connections
4. Index — search / Ask; tabs For you · Your Circle · All members; one reason + city; Message + Circle
5. Ask “Chicago introductions” — location-honest reasons, no Lagos-as-Chicago, no filler words
6. Open **P. Adler** → **Message** — conversation header is P. Adler, not Introductions
7. Messages inbox — DMs + Channels, last-message preview, unread; Inbox drawer: Escape + focus trap
8. Notifications — compact rows, timestamps, “added you to their Circle”, Crossing deep-link
9. Crossings — **Add a trip**; empty city/country cannot advance; timezone from destination; requests show person / meeting / dates
10. Own Profile — portrait first, Edit opens grouped settings
11. Legal → Community: **Absolutely no soliciting. Ban with no refund.**

See [ASTRA_AUDIT_FIXES.md](./ASTRA_AUDIT_FIXES.md).

## Do not

- Invent monthly membership prices
- Copy another network’s name, copy, photographs, or logo
- Present DEMO people or events as real
- Deploy this branch to production from the PR
- Call the Index “Matches”

See [SETUP.md](./SETUP.md) for remaining credentials, prices, assets, and policy decisions.
