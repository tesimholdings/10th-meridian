# TEST_REPORT — 10th Meridian UI polish (Wave 3)

Date: 2026-09-14  
Branch: `cursor/ui-polish-wave3-907d`  
Base: `cursor/crossings-travel-1da1`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | Pending at first push — matching, Open House clock, preview store, Crossings dates/matching/privacy/requests/tables |
| `npm run lint` | Pending at first push |
| `npm run build` | Pending at first push |

Product logic is unchanged. Coverage remains: journey CRUD/pause/delete; date overlaps; matching exclusions; Crossing accept/decline/reschedule; conversation only after accept; group-table capacity; venue hidden until confirmed; Open House isolation of non-demo City Notes; `.ics` only after acceptance.

## UI / product walk-through (this wave)

- Lock: tighter mobile CTAs, hairline countdown, discreet scarcity
- Open House: editorial rhythm, DEMO labeling, unlabeled membership amounts
- Member Home / Matches / Crossings: quieter chrome, Why-you-should-meet readability, premium empty states
- Crossings: coordinates steps, atlas ticks (no pins), Crossing sheet, Table / Notes polish
- Motion respects `prefers-reduced-motion`
- 390px: safe areas, 44px targets, no intended horizontal page scroll

## Privacy (unchanged)

City-level only. No flight numbers, hotel stays, room numbers, GPS, or live location.

## Runtime limitations

- Preview store is in-process and resets on server restart
- Stream compose is DEMO unless keys exist; not E2EE
- Calendar v1 is `.ics` download — no external calendar OAuth
- No production deploy

## Still Stefan’s

Approved prices, hero film, live keys, counsel-approved legal copy.
