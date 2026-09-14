# Crossings

**The people you should know, wherever you land.**  
**When your paths cross, you’ll know.**

Member travel connections for 10th Meridian. City-level presence only — not real-time location sharing.

## Navigation choice

The member bottom bar is already full: **Home · Index · Channels · Members · Profile**.

Crossings is reachable from:

1. The Home card
2. Header **Menu → Crossings**
3. Direct route `/member/crossings`

## Reviewer click-path (preview tools)

1. `/` → Reviewer tools → **Preview as member**
2. Home → **Crossings** card
3. Read the cinematic landing, upcoming Paris journey, atlas (no precise pins), quiet notices
4. **Set Your Coordinates** (or open the existing Paris journey)
5. Who-you-should-meet carousel → open **A Crossing** sheet → propose coffee + dates (or decline/reschedule an incoming request)
6. Accept the DEMO request if needed → **Open conversation** (Stream stub / DEMO channel) and **Download .ics**
7. **Open a Table** from the London suggestion (neighborhood only; venue on the detail page only if confirmed)
8. **City Notes** and **City Hosts** (all labeled SYNTHETIC DEMO)
9. Settings → Crossings notification digest
10. Reviewer tools → **Force Open House cookie** as guest: Crossings remains demonstration-only; mutations 403
11. **Preview as admin** → Steward desk → **Crossings** weights (40 / 25 / 15 / 10 / 10)

## Screenshots

Captured at ~390px and desktop during preview-as-member walkthrough:

- `docs/crossings-screenshots/mobile-landing.webp`
- `docs/crossings-screenshots/desktop-landing.webp`
- `docs/crossings-screenshots/journey-matches.webp`
- `docs/crossings-screenshots/crossing-request-sheet.webp`
- `docs/crossings-screenshots/table-detail.webp`
- `docs/crossings-screenshots/city-notes.webp`
- `docs/crossings-screenshots/city-hosts.webp`

## Privacy

Never collected: flight numbers, hotel stays, room numbers, live coordinates, detailed itineraries.  
Open House never receives real City Notes or journeys — synthetic DEMO only.

## Database

See `supabase/migrations/0006_crossings.sql`. No new environment variables.
