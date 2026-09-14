# 10th Meridian — design review

The development interface gave most content the same weight: rectangular containers, repeated borders, technical explanatory copy, and tightly grouped controls. The refinement creates a quieter, more cinematic house with a clear mobile hierarchy and more expressive movement.

## Design decisions

- **Atmosphere without a film download.** An original generated night-water scene creates depth and a sense of arrival. The source asset is a 100,534-byte WebP, served through Next Image. The previous empty video element and nonfunctional pause control are replaced by actual image drift and orbital motion. The image is decorative and does not imply a real member property or hosted event.
- **Open composition.** Profile and match content uses editorial rows, fine dividers, circular avatars, and stronger serif hierarchy. Floating pill navigation and softened controls replace the rigid full-width navigation bar. Home shows three leading connections with a clear route to the full, unchanged Index.
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

Each journey also includes 430×932, 768×1024, and 1440×1000 captures in the same folders. The original baseline for these eight journeys is commit `28166ba`.

## Validation and reproduction

Run `npm install`, then `npm run dev -- --port 3100`. Use preview mode with reviewer tools enabled and no live credentials. `npm run test:ui` runs Chromium interaction and accessibility checks; install Chromium with `npx playwright install chromium` if needed. `npm run review:screenshots -- after` captures the local application. `REVIEW_URL` can select another local server. The screenshot script fails on unexpected authentication or navigation redirects.

The lockfile is synchronized with the already declared Supabase SSR and Stripe versions, since the incoming lockfile could not pass a clean install. No production dependency is added; Playwright and axe are development-only verification tools.

## Scope and limitations

Authentication, payment integration, APIs, database policies, admissions rules, and matching calculations are unchanged. Existing preview-only persistence and live-service limitations still apply. Live payments, production authentication, hardware camera behavior, and real-device mobile keyboard behavior require environment-specific validation. Legal text, pricing, and live notification/privacy controls remain development placeholders. The profile action that led to general channels is now honestly labeled “Browse channels”; this design pass does not invent a direct-message backend.

The referenced Meridian screenshots were not available in this task. The creative direction follows the supplied written brief and the application's existing branding, with original imagery.
