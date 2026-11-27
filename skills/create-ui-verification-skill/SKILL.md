---
name: create-ui-verification-skill
description: "Generate a safety-bounded, project-local UI verification skill (verify-<app>) with isolated/demo/env modes, checkout locking, a read-only doctor check, persistent headless Chromium over CDP, ARIA-first locators, desktop/mobile and light/dark coverage, durable proof artifacts, and a maintained feature map that /beta-testers can drive directly. Use for /create-ui-verification-skill or when a web app has no safe scripted way to prove UI behavior."
disable-model-invocation: true
---

# Create a UI verification skill

Generate a project-local `verify-<app>` skill (under `.agents/skills/verify-<app>/` or `.cursor/skills/verify-<app>/`, matching the repo's convention) so any future agent — and [`/beta-testers`](../beta-testers/SKILL.md) — can launch, health-check, drive, audit, and tear down the real web application safely.

Write the generated skill for a cold agent mid-task, not for a human tutorial. Leave zero placeholders.

## 1. Interview the codebase first

Inspect the repo before asking the user anything:
- **Framework & start command:** Next.js, Vite, Remix, SvelteKit, Rails, etc. (`package.json`, `Makefile`, `.nvmrc`, `README.md`).
- **Surfaces & routes:** public/marketing pages, onboarding/signup, auth pages, authenticated app/portal, locales, light and dark themes.
- **Safety boundaries (critical):** list every env var that triggers real side effects — billing (Stripe), email (Mailgun/Resend/Postmark), SMS/telephony, paid AI/LLM APIs, external webhooks, production databases.
- **Auth & demo accounts:** how does local sign-in work? Is there a safe demo/seed account, and how do we fail closed if an account belongs to a real paying customer or has MFA enabled?
- **Browser & visual audit tooling:** check if Playwright or Chromium is already installed in the repo (or a sub-package), and whether a rendered layout/contrast checker (such as `impeccable detect`) is available.
- **Locking & isolation:** does the framework share a build cache inside one worktree (such as `.next/`)? If so, the generated helper must hold a per-checkout lock so two runs never corrupt each other.

If the repo does not start cleanly as-is, fix or report that blocker first; never generate a verification skill on a broken base.

---

## 2. Generate the executable CLI helper (`scripts/verify-<app>.mjs`)

Build one zero-mystery CLI helper with these exact subcommands:

1. **`launch [--mode isolated|demo|env] [--port N] [--json]`**
   - **Three-tier safety modes:**
     - `--mode isolated` (default): stubs database/auth URLs and blanks **every** billing, outbound mail/SMS, AI, and external vendor key. Works with zero `.env.local` and cannot touch production or spend money.
     - `--mode demo`: auto-discovers `.env.local` (including from the main checkout when run inside a git worktree via `git rev-parse --git-common-dir`), forwards **only** the narrow DB/auth keys needed for authenticated reads/demo login, and keeps all billing/outbound/paid vendor keys blanked.
     - `--mode env`: loads `.env.local` in full; strictly read-only and explicit opt-in only.
   - **Checkout lock & ephemeral port:** refuses a second launch in the same worktree; binds an ephemeral localhost port.
   - **Usable readiness:** waits until BOTH the health endpoint returns `200` AND the root page renders expected application HTML (not just port open).
   - **Separated paths outside the repo:**
     - Runtime scratch in `/tmp/<app>-verify-<runId>/` (`state.json`, `server.log`, `chrome-profile/`)
     - Durable proof in `/tmp/<app>-verify-evidence/<runId>/` (or `--evidence-dir`)
     - Never write untracked artifacts into the git checkout.

2. **`doctor --run-dir DIR [--strict-head] [--json]`**
   Read-only health check that must pass before any `browser` drive. Check:
   - `process_alive` (recorded PID is alive)
   - `port_owned` (listening socket belongs to our process group)
   - `checkout_and_head` (matches repo path, and `HEAD` if `--strict-head`)
   - `api_health` and `home_ssr` (usable HTML rendered)
   - `auth_gate` (protected route redirects unauthenticated requests as expected)
   - `mode_boundary` (confirms isolated mode cannot reach real DB / demo mode can)
   - `browser_binary` (Playwright/Chromium exists on disk)
   - `visual_detector` (optional `impeccable` or built-in overflow/contrast check)

3. **`login-demo --run-dir DIR` (when the app has authenticated routes)**
   - Signs in through the app's **real** auth flow (never a fake dev bypass cookie).
   - **Fails closed** if the target account is not explicitly classified as a demo/internal test account or has real customer data / MFA enabled.

4. **`browser --run-dir DIR <action>`**
   - Attaches to one persistent headless Chromium over loopback CDP with sticky viewport and color scheme across steps.
   - Actions: `goto`, `click`, `fill`, `select`, `press`, `wait`, `viewport`, `theme`, `state`, `snapshot` (ARIA tree), `screenshot`.
   - Prefer stable ARIA locators (`--role`, `--name`, `--label`, `--text`) over brittle CSS selectors.
   - `state` reports current URL, `<html lang>`, active theme, `pageErrors` count, and `horizontalOverflow` boolean.

5. **`detect --run-dir DIR [path] [--viewport WxH] [--cdp] [--save PATH]`**
   - Runs rendered contrast, overflow, and layout checks (`impeccable detect` when installed, or built-in DOM contrast/overflow/a11y audit) and saves JSON into `$EVIDENCE_DIR`.

6. **`http --run-dir DIR <METHOD> <path> [--no-follow] [--save PATH]`**
   - Direct HTTP probe for redirects, headers, auth gates, and status codes, saved to `$EVIDENCE_DIR`.

7. **`cleanup --run-dir DIR`**
   - Kills **only** the recorded `serverPid`/`pgid` and `chromePid`/`pgid` (never `pkill` by process name).
   - Removes `$RUN_DIR` and clears the checkout lock.
   - **Preserves `$EVIDENCE_DIR`** and prints `evidencePreserved: true`.

---

## 3. Generate `SKILL.md` and the feature map

1. Write `<skills-dir>/verify-<app>/SKILL.md` with valid YAML frontmatter (`name: verify-<app>`, concrete `description`) covering: Surfaces, Launch modes, Doctor checks, Drive commands, Evidence standards, Cleanup, and Feature map links.
2. Seed `<skills-dir>/verify-<app>/features/README.md` plus **3-6 feature files** covering the app's main user journeys (for example: homepage/marketing, onboarding/signup, auth, main authenticated workspace in light + dark + `390x844` mobile, and key public/shared flows).
3. Every feature file follows four H2 sections:
   - `## Sub-features` (short IDs, one line per behavior)
   - `## How to get to it (user POV)` (every user entry point)
   - `## Driving it with verify-<app>` (`Preconditions:` + exact commands + observable results)
   - `## Gotchas` (real traps, never weaken a journey to pass)

---

## 4. Prove the generated skill end to end

A generated verification skill that was never executed is only a draft. Before finishing:
1. Run `launch --mode isolated --json`.
2. Run `doctor --run-dir "$RUN_DIR"` and confirm healthy.
3. Drive **at least one** mapped feature across desktop (`1440x900`) and mobile (`390x844`), capturing an ARIA snapshot, a PNG screenshot, and a `detect` or `state` check with zero `pageErrors` and `horizontalOverflow: false`.
4. Run `cleanup --run-dir "$RUN_DIR"` (and always run cleanup after any failed attempt too).
5. Verify the evidence files still exist on disk after cleanup (`evidencePreserved: true`).
6. Report the exact verified paths, any mode preconditions not run (such as missing `.env.local` for `--mode demo`), and note that [`/beta-testers`](../beta-testers/SKILL.md) can now drive this harness automatically.
