---
name: strongman
description: "High-autonomy unblocking mode for non-sensitive tasks when an agent stalls on unnecessary approvals, hands back manual next steps it could run itself, or loops on the same failing approach. Brings in a fresh model/provider for a creative angle and drives every sanctioned tool (shell, browser, tests) end to end to a verified result. Use for /strongman when you need to push a stuck non-sensitive task across the finish line."
disable-model-invocation: true
---

# Strongman

Push a stuck, **non-sensitive** task across the finish line without stalling on unnecessary check-ins or handing back a list of manual steps the agent could execute itself.

Read [`../../docs/harness.md`](../../docs/harness.md) when picking a fresh model or provider and mapping browser/subagent tools.

## When to use (and hard boundaries)

Use `/strongman` when an agent is looping, over-asking for approval on reversible local steps, or saying *"here are the next steps for you"* on work it has the tools to finish.

**Hard boundaries that `/strongman` NEVER crosses:**
- **Non-sensitive scope only:** never run this mode against live customer data, production databases, real billing/payments, production deploys, or outbound customer emails/SMS without explicit user approval.
- **No rule or security bypasses:** never bypass access controls, permissions, credentials, CAPTCHAs/anti-bot checks, sandbox boundaries, or branch protection.
- **No faked completion:** never silence a failing check, skip verification, or claim something works without running it.

---

## Workflow

### 1. State the end state and cut the dead loop
In 2-3 lines (internal or brief status):
- Define the exact **observable done state** (what must run, pass, render, or exist when finished).
- List what has **already been tried and failed** so no effort is wasted repeating the same dead end.

### 2. Break tunnel vision with a fresh model (different provider preferred)
When the current session is stuck or repeating itself, delegate the bottleneck to a **fresh subagent** with zero stale conversation baggage:
- **Prefer a different model family/provider** when available (check `~/.config/frond/models.md` or T3 Code / multi-model capabilities), or a **different model tier** within the same provider (for example, a fast creative Sonnet/Flash explorer when Opus is over-thinking, or a flagship deep model when a smaller model missed a subtle constraint).
- Give it a tight, outcome-oriented brief:
  - The goal and observable done state.
  - What failed so far (do not repeat it).
  - Explicit instruction: *"Take a fresh, creative technical angle. Use every sanctioned tool available — shell, scripts, headless/live browser, tests — to solve and verify it directly instead of handing back manual steps."*

### 3. Drive every sanctioned tool end to end
Execute every reversible step yourself instead of pausing to ask:
- **Browser & UI:** launch the app, drive the real browser (Playwright, `verify-<app>`, or browser subagent), inspect rendered DOM/console/network errors, and capture screenshots.
- **Code & tooling:** write small diagnostic scripts, test hypotheses directly, run builds/checks/tests, and iterate until green.
- **Pivot fast:** if one approach fails twice, abandon it and try a genuinely different technical route (different API, simpler architecture, direct reproduction script, reading installed dependency source).

### 4. Escalate only on genuine external blockers
Stop and ask the user **only** when blocked by something an agent genuinely cannot cross:
- Missing secret, login, 2FA, or CAPTCHA that requires the human
- An irreversible or sensitive action (production deploy, live customer write, paid charge, external message)
- A pure product/UX decision with no objectively right technical answer

When escalating, finish every unblocked piece first and ask for **one crisp action** with full context.

### 5. Prove the result and report honestly
Before finishing:
- Run the final verification on the real artifact (command output, passing test, or live browser screenshot).
- Report cleanly:
  - **What is done** (and exact proof that it works)
  - **The angle that broke the deadlock** (including which model/provider solved it, if delegated)
  - **Any trade-offs or shortcuts taken** that deserve cleanup later (so creative unblocking never hides tech debt)
