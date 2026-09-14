# Wave 3 UI polish

Branch: `cursor/ui-polish-wave3-907d`  
Base: `cursor/crossings-travel-1da1`  
Scope: cinematic feel, approved Lifetime price, referral card, planned domain, Index naming, visitor-local Open House, no-soliciting. Gating logic, ranking math, privacy, and Crossings flows are unchanged except timezone evaluation. No production promote.

## Palette (Stefan, 2026-09-14)

Gold, black, and white as the core, plus **fresh sailor / water blues** (harbor, spray, clear marine). Welcoming, fun, and luxury — yacht light on water, not a purely dark private club, not neon, not SaaS.

Tokens live in `src/app/globals.css`: `--void` / `--ink` (black structure), `--ivory` (crisp sailcloth type), `--gold`, `--ocean` / `--teal` / `--harbor` / `--spray`. Cascaded through lock, Open House, member shell, Index, Crossings, admin, hero poster, mark, favicon, and mail HTML.

## Naming — Index, never Matches

Member-facing word is **Index**. Nav: Home · **Index** · Channels · Members · Profile. Route `/member/index`. Legacy `/member/matches` and `/demo/matches` redirect.

Keep **Meridian 10 / Meridian 100 / Meridian Index**. Internal types (`MatchBoard`, `computeMatchIndex`, `matchesForJourney`) may stay. Do not reintroduce “matches” in member copy — it reads dating-like. Coordinate with the sibling profile/public-site/network agent on this name.

## Motion

Cinematic page enters, card reveals, countdown stagger, lock/Open House hero drift. Animations use `pointer-events: auto` and stay short so they do not block interaction. `prefers-reduced-motion: reduce` kills decorative motion and pauses the hero film.

## Open House hours (visitor local time)

- General doors: **10:00–22:00 on the 10th in the visitor’s IANA timezone** (browser `tm_tz` cookie).
- Referral early: **09:00–10:00 in that same local timezone** (one hour before general). Kept because it is a clean local hour and not awkward.
- Fallback if the zone is missing or invalid: **America/Chicago**.
- Server accepts the IANA **name** only. Access is evaluated with the **server clock**. The countdown is display-only.

## Anti-soliciting (hard rule)

Absolutely no soliciting. A ban is permanent and **without refund**. Members may refer people. You may mention yourself **only if someone is asking**.

Surfaced on Open House (“The house rule”), onboarding, apply terms, community/terms/refund placeholders, and channel compose hints.

## Pricing (approved)

- Public membership: **Lifetime, $10,000, one time**
- Organization / Strategic Partnership: **By application**
- No monthly product in the public section. Monthly billing will come later (`SETUP.md`)
- Stripe Checkout is `mode: "payment"` and stays stubbed until `STRIPE_SECRET_KEY` + `STRIPE_LIFETIME_PRICE_ID` (one-time $10,000) exist
- `founding` / `standard` checkout posts alias to Lifetime

## Admissions

Unchanged: no more than ten new members hand-selected each month; internal cap 10 with existing steward override.

## Referral card

Original print view at `/referral/{code}/card` (Print card from Steward desk). Gold fittings, black structure, sailor water, space for the code and a high-contrast QR. Print or save PDF with backgrounds enabled. QR: `/api/referrals/qr?code=`.

## Domain

Planned production origin: **https://tenmeridian.com** (`plannedProductionUrl` in `src/lib/config/site.ts`). Not purchased. Preview URLs still use `NEXT_PUBLIC_SITE_URL`. Do not buy or attach the domain from this PR.

## Earlier polish (still in this PR)

Tighter lock CTAs, editorial Open House rhythm, quieter member chrome, Why-you-should-meet blocks, Crossings atlas ticks (no pins), premium empty states, `prefers-reduced-motion`, 390px safe areas.
