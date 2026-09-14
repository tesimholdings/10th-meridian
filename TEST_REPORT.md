# TEST_REPORT — Astra audit redesign

Date: 2026-09-14  
Branch: `cursor/astra-audit-fixes-e546`  
Base: `cursor/profiles-network-openhouse-2de8`  
Runtime: Node 22, Next.js 16.3.5, preview mode (no live secrets)

## Automated

| Check | Result |
| --- | --- |
| `npm test` | 74/74 pass — prior coverage plus Ask explanations, DM destination, journey Where validation, Index reason line |
| `npm run lint` | Pass (0 errors) |
| `npm run build` | Pass — Next.js 16.3.5 Turbopack, TypeScript clean |

## Product coverage (this wave)

- Open House 10:00–22:00 in the **provided IANA timezone**; referral 09:00 local; fallback `America/Chicago`
- Lock-screen countdown uses the same `evaluateOpenHouse` `nextOpenAt`
- Profiles: gallery (Storage stub + DEMO), optional website/LinkedIn, privacy, in-common, upcoming events
- Your Circle add/remove; Remove from Index; hide/block still respected
- House notifications + in-app/email/digest prefs
- DMs from profile / Index / Members (Stream when keys exist; DEMO otherwise; not E2EE)
- Community: Absolutely no soliciting. Ban with no refund.
- Bottom nav: Home · Index · Channels · Members · Profile
- UI vibe: gold/white/black chrome; original water / yacht / concert stills on Open House, Index, and profiles; reduced-motion honored for new animations

## Privacy

Profiles are never public or indexed. Open House walkthrough is SYNTHETIC DEMO only. City-level location only. Optional fields honor privacy flags.

## Runtime limitations

- Preview store is in-process and resets on server restart
- Stream compose is DEMO unless keys exist; not E2EE
- Gallery uploads are a Storage stub
- Calendar v1 is `.ics` download — no external calendar OAuth
- No production deploy
- Domain `tenmeridian.com` is prepared, not purchased

## Still Stefan’s

Hero film, live keys, counsel-approved legal pages, Stripe lifetime Price ID.
