# Astra audit fixes

Review branch only. Do not merge to main. Do not promote production.

## P0

1. **DM destination** — Message from a profile or Index opens `/member/messages?to={id}&channel={dm}`. The inbox never falls back to `#introductions`. If the DM cannot load, the header still names the member, compose is disabled, and Retry is explicit. Destination stays in the URL across refresh and back.
2. **Ask the Meridian** — Stop words are dropped. Location is interpreted separately from skills. Chicago queries do not present Lagos/Paris as Chicago. Partial matches say where the person actually is. No “Signal on who, can…” filler. Hybrid Index matching is unchanged.
3. **Channel drawer** — Mobile inbox is a labeled `dialog`, focus moves inside, Tab is trapped, Escape dismisses, focus returns to the trigger.
4. **Journey validation** — Add a trip cannot leave Where without city and country. Timezone is inferred from the destination when known; otherwise an explicit valid IANA zone is required. No silent `Europe/Paris`. Entered values stay on failure.
5. **Crossing requests** — Each request shows the other member, the meeting format, the city, and human-readable dates. Reschedule uses a labeled date control.

## Shell

Nav is **Home · Index · Messages · Crossings · Profile**. Index holds For you / Your Circle / All members. Messages holds DMs + Channels. Header search + notification bell. Desktop left rail uses the same names. Nothing is called “Matches”.

## Visual + copy

Warm white `#FAF8F2`, navy `#092B45`, blue `#087CB8`, aqua `#30C8D2`, gold `#C4A264`. Serif for names and major moments; sans for nav, messages, forms. Round avatars, pills, fine lines. Nightlife stills are occasional (experiences), not default chrome. Higgsfield slots are marked on existing House stills.

Copy is shortened: lock is headline + countdown + Remind me; Open House is hero, three benefits, experiences, $10,000 lifetime, no-soliciting; Home leads with connections and the next trip/experience; Index reasons are one line + city.

## Motion

Press ~150ms, tabs/cards ~220ms, sheets ~300ms, stagger 40ms. Reduced-motion disables animation. Hero film is muted, inline, pause-controlled, and pauses offscreen. No autoplay audio.

## Preserved

Meridian Index matching, private membership, introductions, Crossings purpose, $10,000 lifetime, 10/month cap, local Open House 10–10, no-soliciting (ban, no refund). No public feed.

## Remaining limitations

- Higgsfield / TexasTurf stills are not in-repo; slots use original House placeholders.
- Preview store is in-process and resets on restart.
- Stream compose is DEMO unless keys exist; not E2EE.
- Gallery uploads are a Storage stub.
- No production deploy.
