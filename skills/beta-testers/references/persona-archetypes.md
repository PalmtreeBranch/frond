# Persona archetypes for `/beta-testers`

Cast **10 personas** by pairing each archetype below with a realistic user of **this specific app**. Adapt the user's job, language, and goal to match the repo you inspected in Phase 1.

| # | Archetype | Viewport & Theme | Behavioral Habits | What They Catch |
| --- | --- | --- | --- | --- |
| 1 | **Low-tech hesitant user** (e.g., 62, dislikes technology) | Desktop `1280x800`, light | Reads labels literally, avoids guessing hidden icons, hesitates before clicking destructive or unclear buttons, confused by technical jargon or abbreviations | Unclear labels, icon-only mystery buttons, scary or ambiguous CTAs, jargon, missing confirmation feedback |
| 2 | **Mobile-first thumb user** | Mobile `390x844`, light | One-handed scrolling, expects big tap targets, switches between portrait sections quickly, hates pinch-zooming | Horizontal overflow, clipped modals/drawers, tiny tap targets (<44px), sticky headers/footers hiding buttons, broken mobile nav |
| 3 | **Desktop power user** | Desktop `1440x900`, light | Uses `Tab`, `Enter`, `Escape`, opens links in new tabs, scans headings fast, expects instant keyboard submit | Broken focus order, Escape not closing modals, Enter not submitting forms, wasted vertical whitespace, dead links |
| 4 | **Double-clicker & rage-clicker** | Desktop `1280x800`, light | Double-clicks every primary button, clicks submit again during loading, hits Browser Back mid-request, refreshes right after saving | Missing disabled/pending button state, duplicate POSTs/records, race conditions, broken Back-button state, toast spam |
| 5 | **Tech-savvy skeptic** | Desktop `1440x900`, dark | Manually edits URL slugs/query params, refreshes deep routes, switches themes mid-session, inspects empty/invalid states and console output | Broken deep links, missing 404/invalid-token handling, dark-mode contrast failures, console errors, exposed raw IDs or stack traces |
| 6 | **Zero-context first-timer** | Desktop `1366x768`, light | Never saw a demo, skips long intro copy, lands cold on the homepage or signup funnel and tries to finish the core task in 2 minutes | Broken onboarding flow, dead ends, unclear next step, empty states with no CTA, auth redirect loops |
| 7 | **Messy-input user** | Mobile `390x844`, dark | Types leading/trailing spaces, accented/Nordic characters (`åäö`, `é`), emojis, very long strings, invalid email/URL/date formats, submits empty required fields | Missing/cryptic validation errors, form state wiped on error, text truncation/overflow, crashes on special characters |
| 8 | **Accessibility & zoom user** | Narrow `768x900` or 200% zoom, light | Navigates by keyboard (`Tab`/`Shift+Tab`/`Space`), checks visible focus outlines, color contrast, form `<label>` associations, and `aria-live` error announcements | Invisible focus rings, low-contrast text/placeholders, unlabeled inputs/buttons, focus trapped or lost after modal close |
| 9 | **Interrupted & slow-network user** | Mobile `390x844`, light | Leaves a form half-filled, navigates away and returns, reloads mid-wizard, triggers slow or failing requests | Lost draft data without warning, infinite spinners, unhandled failed fetches, missing retry/recovery UI |
| 10 | **Domain-specific buyer / operator** | Desktop `1440x900`, light (or app's primary customer device) | Mirrors the app's real paying customer under real-world pressure (e.g., busy restaurant manager, clinic receptionist, finance lead) | Missing trust signals, wrong domain terminology, awkward multi-step workflows, mismatch between marketing promise and product UI |

## Casting rules

- **Ground every persona in the product.** Example: for a B2B restaurant portal, Persona #1 is "Ingrid, 62, bakery owner who still prefers paper calendars and only opens the portal once a week to change holiday hours" — not "Generic 62yo woman".
- **When testing a targeted PR or feature**, keep all 10 archetypes but point all 10 missions at the changed surface and its immediate neighbors (entry point, main interaction, error/empty state, and post-action confirmation).
- **Locale & language**: if the app supports multiple locales (e.g., Swedish + English), assign at least 2 personas to switch locales or verify untranslated strings/date formats.
- **No synthetic overlap**: verify that the 10 missions collectively touch desktop + mobile, light + dark, happy path + error path, and navigation/reload edges.
