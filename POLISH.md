# Wave 3 UI polish

Branch: `cursor/ui-polish-wave3-907d`  
Base: `cursor/crossings-travel-1da1`  
Scope: cinematic and mobile feel only. Gating, matching, privacy, and Crossings logic are unchanged. No membership prices were invented.

## Identity kept

Deep black / charcoal, midnight ocean and teal, ivory type, antique gold accents, editorial serif + tracked sans, fine borders, meridian / compass motifs. No generic SaaS chrome, neon, or busy dashboards.

## What changed

### Lock screen
- Tighter mobile CTA cluster: primary Sign In, two-up Referral / Scan QR, Remind as a quiet text link
- Scarcity line moved to discreet 10px type
- Countdown is a hairline rail with padded tabular numbers, not four boxes
- Stronger poster vignette, night-water poster SVG, reduced-motion still pauses the film

### Open House
- Editorial rhythm: large hero → quiet philosophy → full-bleed meridian moment → quiet “not this / who belongs” → Index cards → quiet admissions → membership seats → DEMO gallery → quiet experiences
- Clearer **DEMO · walkthrough only** labeling
- Membership cards still show approved placeholders only — no amounts

### Member Home / Matches / shell
- Quieter header, Menu, DEMO banner, and bottom nav (gold hairline instead of loud gold type)
- Cards use a shared `panel` surface
- “Why you should meet” is a readable gold-rule block with relaxed leading
- Premium empty / loading / error states (compass mark, editorial copy)

### Crossings
- Set Your Coordinates: four-step rail, titled step, panel fields
- Match carousel: snap cards, hidden scrollbar, Why-you-should-meet block
- Atlas: faint landmasses, meridians, tick marks — destination as a gold ring, never a pin
- A Crossing sheet: handle, initials, quieter form
- Open a Table / City Notes / City Hosts: panel forms, DEMO marks, premium empty states

### Motion & mobile
- Slow `rise` / sheet fade; all animations honor `prefers-reduced-motion`
- Safe-area padding on lock, member, and admin; 44px thumb targets; `overflow-x: clip`

### Admin
- Horizontal steward nav on mobile, quieter active state, panel stats

## Out of scope (unchanged)

Live Supabase / Stripe / Stream / Resend wiring. Legal copy. Information architecture. Production deploy.
