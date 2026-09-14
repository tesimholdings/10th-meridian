# TEST_REPORT — 10th Meridian Crossings

Date: 2026-09-14  
Branch: `cursor/crossings-travel-1da1`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | Pass — Meridian Index, Open House clock, preview store, Crossings dates/matching/privacy/requests/tables |
| `npm run lint` | Pass |
| `npm run build` | Pass — no live keys required |

New coverage includes: journey CRUD/pause/delete; date overlaps and timezone boundaries; matching exclusions (blocked, hidden, paused, suspended, expired); meridian/host/fellow-traveler ranking; Crossing accept/decline/reschedule; conversation only after accept; group-table capacity and invitation-only; venue hidden until confirmed; expired journey visibility; Open House isolation of non-demo City Notes; `.ics` only after acceptance.

## HTTP / product behavior

- Home card + `/member/crossings` (bottom nav unchanged: Home · Matches · Channels · Members · Profile)
- Set Your Coordinates, pause/edit/delete
- Destination match carousel with “Why you should meet”
- A Crossing sheet: propose / accept / decline / reschedule
- Open a Table: neighborhood public, venue private, channel after confirmation
- City Hosts opt-in (never concierge copy)
- City Notes: attribution, save, report, steward hide
- Notifications + digest controls (no repeat keys)
- Admin travel weights 40 / 25 / 15 / 10 / 10
- Open House guests: SYNTHETIC DEMO only; mutations 403

## Privacy

City-level only. No flight numbers, hotel stays, room numbers, GPS, or live location. Historical Crossings remain private after a journey expires.

## Runtime limitations

- Preview store is in-process and resets on server restart
- Stream compose is DEMO unless keys exist; not E2EE
- Calendar v1 is `.ics` download — no external calendar OAuth
- No production deploy

## Still Stefan’s

Approved prices, hero film, live keys, counsel-approved legal copy.
