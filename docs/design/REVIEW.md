# 10th Meridian — design review

The development interface gave most content the same weight: rectangular containers, repeated borders, technical explanatory copy, and tightly grouped controls. The refinement creates a quieter, more cinematic house with a clear mobile hierarchy and more expressive movement.

## Design decisions

- **Atmosphere without a film download.** An original generated night-water scene creates depth and a sense of arrival. The source asset is a 100,534-byte WebP, served through Next Image. The previous empty video element and nonfunctional pause control are replaced by actual image drift and orbital motion. The image is decorative and does not imply a real member property or hosted event.
- **Open composition.** Profile and match content uses editorial rows, fine dividers, circular avatars, and stronger serif hierarchy. Floating pill navigation and softened controls replace the rigid full-width navigation bar. Home shows three leading connections with a clear route to the full, unchanged Index. Crossings has a dedicated dock destination; the member directory remains in the Menu.
- **Motion with a purpose.** Cinematic image drift, orbital movement, viewport reveals, animated form steps, progress transitions, dialog entrances, and touch/hover responses. Native browser animation APIs avoid a new animation runtime. Header controls pause motion across navigation; system reduced-motion preferences disable it automatically. Background-tab animations pause. Content remains visible with JavaScript disabled.
- **Clearer decisions.** The Index describes the relevance score and retains every original match explanation. The scoring algorithm is untouched. Application review summarizes contact details before submission. Technical status explanations are removed from the main product narrative while synthetic data and preview limitations remain explicit.
- **Reliable recovery.** Failed messages retain per-channel and per-thread drafts. Failed onboarding saves stay on the current step. Applications restore their tab-local draft, validate required fields, allow retries, and confirm successful receipt. Feedback, introductions, reminders, event registration, and referrals report connection failures. Sign-in displays the existing server error state.
- **Accessible interaction.** Visible keyboard focus, a skip link, native modal focus management, Escape dismissal and focus return, 44–52 px primary controls, 16 px form inputs, contrast-tested colors, responsive layouts, and meaningful empty/loading/error states. QR camera tracks are released when decoding is unsupported or the component disappears.

## Review artifacts

Open [the comparison gallery](index.html) and choose a journey and screen size. All screenshots use synthetic preview data, with development-only overlays hidden and motion reduced for stable inspection.

| Journey | Before, phone | After, phone |
|---|---|---|
| Monthly threshold | [Before](before/lock-mobile.png) | [After](after/lock-mobile.png) |
| Home | [Before](before/home-mobile.png) | [After](after/home-mobile.png) |
| Meridian Index | [Before](before/index-mobile.png) | [After](after/index-mobile.png) |
| Channels | [Before](before/channels-mobile.png) | [After](after/channels-mobile.png) |
| Directory | [Before](before/members-mobile.png) | [After](after/members-mobile.png) |
| Application | [Before](before/apply-mobile.png) | [After](after/apply-mobile.png) |
| Onboarding | [Before](before/onboarding-mobile.png) | [After](after/onboarding-mobile.png) |
| Open House | [Before](before/open-house-mobile.png) | [After](after/open-house-mobile.png) |
| Crossings | [Before](before/crossings-mobile.png) | [After](after/crossings-mobile.png) |
| Crossing request | [Before](before/request-mobile.png) | [After](after/request-mobile.png) |
| City Notes | [Before](before/city-notes-mobile.png) | [After](after/city-notes-mobile.png) |
| Open a Table | [Before](before/table-new-mobile.png) | [After](after/table-new-mobile.png) |

The collection contains 128 screenshots across sixteen views, including Crossings, journey detail, the request sheet, coordinates, City Notes, City Hosts, table listings, and table creation. Each view includes 390×844, 430×932, 768×1024, and 1440×1000 captures. All before captures use the completed Crossings branch at commit `a5d3ec0`.

## Crossings refinements

- A dedicated dock destination, cinematic arrival panel, open journey layout, and an explicitly imagined animated atlas. The atlas is decorative and does not pretend to show exact member coordinates.
- Native date pickers replace comma-separated request dates. Request sheets use native modal focus handling, Escape dismissal, and focus restoration. Required journey fields validate before advancing; selected-channel visibility now provides actual channel choices using the existing API field.
- Requests identify the other member, preserve input on failure, and open the supplied accepted-conversation channel. Table host actions show member names instead of record IDs.
- City Notes add city/country search, clear category selections, visible form labels, and an editable country field. Hosts, notes, table actions, notification preferences, and journey controls provide recoverable errors and prevent overlapping writes.
- A narrow frontend defect correction converts table wall times in the selected destination timezone instead of the device timezone. Four unit tests cover London, fractional-hour offsets, and daylight-saving gaps/ambiguity. APIs and matching/date-overlap business logic are unchanged.

[Watch the motion preview](motion-preview.webm). It shows the threshold, Crossings atlas, floating navigation, and request sheet using synthetic preview data.

## Validation and reproduction

Final verification passed:

- ESLint and the production Next.js build.
- All 49 unit tests, including the existing matching, access, preview, and Crossings suites.
- All 18 Chromium browser tests: responsive layouts and axe accessibility checks (including contrast), application and onboarding recovery, message drafts, modal focus, motion preferences, directory filtering, Crossings requests, journey visibility and lifecycle, destination table time, City Notes, and accepted-conversation routing.
- Responsive checks at 390×844, 430×932, 768×1024, and 1440×1000. These use browser emulation; real-device limitations are listed below.


Run `npm install`, then `npm run dev -- --port 3100`. Use preview mode with reviewer tools enabled and no live credentials. `npm run test:ui` runs Chromium interaction and accessibility checks; install Chromium with `npx playwright install chromium` if needed. `npm run review:screenshots -- after` captures the local application. `REVIEW_URL` can select another local server. The screenshot script fails on unexpected authentication or navigation redirects.

The lockfile remains aligned with the declared runtime versions. The initial foundation lockfile could not pass a clean install; Crossings independently included that synchronization. No production dependency is added; Playwright and axe are development-only verification tools.

## Scope and limitations

Authentication, payment integration, APIs, database policies, admissions rules, and matching calculations are unchanged. Existing preview-only persistence and live-service limitations still apply. Live payments, production authentication, hardware camera behavior, and real-device mobile keyboard behavior require environment-specific validation. Legal text, pricing, and live-service configuration remain development placeholders. Crossings notification controls now exist in the upstream feature and retain their behavior. The profile action that led to general channels is now honestly labeled “Browse channels”; this design pass does not invent a direct-message backend.

The referenced Meridian screenshots were not available in this task. The creative direction follows the supplied written brief and the application's existing branding, with original imagery.
