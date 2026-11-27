---
name: frond-help
description: "Guide users through frond setup, /frond-mode, and picking the right skill or playbook for a task. Checks whether the active runtime is configured in ~/.config/frond/models.md and hands back one ready-to-paste prompt without starting work. Use for /frond-help or 'which frond skill should I use?'."
disable-model-invocation: true
---

# Frond help

Answer questions about `frond`, check what is configured in the active runtime, and hand the user one ready-to-paste prompt.

**Never start executing the underlying coding task on a `/frond-help` turn.** The user asked for guidance, and running a full workflow spends tokens. (If they explicitly say *"use frond to fix X"*, load [`../frond-mode/SKILL.md`](../frond-mode/SKILL.md) and do the work instead.)

## Step 1: Check local setup state (quietly)

Check two things and mention them **only** when relevant to the user's question:
1. Does `~/.config/frond/models.md` exist, and does it have a section for the **active runtime** (`antigravity`, `claude-code`, `cursor`, `codex`, or `t3-code`)? If missing, note in one line that `/setup-frond` configures models for this runtime without overwriting other tools.
2. Does the current project have a `verify-*` skill (under `.agents/skills/`, `.cursor/skills/`, or `.claude/skills/`)? Mention `/create-ui-verification-skill` only when the user asks about UI testing or `/beta-testers`.

## Step 2: Route to the right skill

| What you want to do | Skill to run | Example prompt |
| --- | --- | --- |
| Run any non-trivial task end to end with playbooks & rules | [`/frond-mode`](../frond-mode/SKILL.md) | `/frond-mode fix the double-submit bug on the billing page and verify it live` |
| Configure models for this tool (Antigravity, Claude Code, Cursor, Codex, T3 Code) | [`/setup-frond`](../setup-frond/SKILL.md) | `/setup-frond` |
| Make a vague idea or rough Linear ticket sharper before coding | [`/sharpen`](../sharpen/SKILL.md) | `/sharpen add exportable monthly reports to the portal` |
| Check whether a UI feature belongs in the dashboard/portal (anti-slop) | [`/feature-fit`](../feature-fit/SKILL.md) | `/feature-fit should we add a new status card to the portal home?` |
| Work through an ordered list of Linear/GitHub issues (1 issue = 1 PR) | [`/work-queue`](../work-queue/SKILL.md) | `/work-queue do VOC-120, VOC-124, and VOC-129 in order to PR open` |
| Fix a bug repro-first with the smallest red-then-green check | [`/repro-first`](../repro-first/SKILL.md) | `/repro-first invitations fail when the email has trailing spaces` |
| Turn a customer screenshot, support email, or call into an anonymized test | [`/replay-customer-bug`](../replay-customer-bug/SKILL.md) | `/replay-customer-bug turn this support report into a replay test and verify no duplicate SMS fires` |
| Check what a small risky diff could break outside grep | [`/blast-radius`](../blast-radius/SKILL.md) | `/blast-radius check what changing this webhook payload could break` |
| Unblock a stuck non-sensitive task with a fresh model & full tool drive | [`/strongman`](../strongman/SKILL.md) | `/strongman push this local Playwright setup over the finish line and prove it passes` |
| Write/audit multi-language UI copy, glossaries, and ICU safety | [`/locale-craft`](../locale-craft/SKILL.md) | `/locale-craft audit the new Swedish and Dutch strings in this diff` |
| Build a safe `verify-<app>` CLI (isolated/demo/env modes + Chromium) | [`/create-ui-verification-skill`](../create-ui-verification-skill/SKILL.md) | `/create-ui-verification-skill` |
| Test live UI with 10 (or `N`) real-world personas on a chosen model tier | [`/beta-testers`](../beta-testers/SKILL.md) | `/beta-testers 10 personas on balanced focusing on /onboarding` |
| Strip AI slop comments and unsafe lint/TS suppressions before review | [`/comment-cleanup`](../comment-cleanup/SKILL.md) | `/comment-cleanup` |
| Run a 4-lens read-only review + skeptic + JSONL finding fates | [`/pre-ship-review`](../pre-ship-review/SKILL.md) | `/pre-ship-review base origin/main intent "prevent duplicate booking emails"` |
| Run a 3-model blind parallel council review (max 3 rounds) | [`/council`](../council/SKILL.md) | `/council review this auth migration before opening the PR` |
| Run a full security, scalability, and performance audit (Severity x Likelihood) | [`/system-audit`](../system-audit/SKILL.md) | `/system-audit full --explorers balanced --chief deep` |
| Merge a green PR (SHA-pinned) and verify it live in production | [`/land-pr`](../land-pr/SKILL.md) | `/land-pr merge when green and verify live` |
| Draft a short human email/SMS/chat update from verified facts only | [`/stakeholder-reply`](../stakeholder-reply/SKILL.md) | `/stakeholder-reply draft a Swedish email to Anna explaining the fix is live` |
| Turn a repeated mistake into a structural fix + red-without-fix check | [`/correction-loop`](../correction-loop/SKILL.md) | `/correction-loop prevent raw summary text from reaching email subject lines` |
| Mine this session for durable improvements to `frond` or `AGENTS.md` | [`/reflect`](../reflect/SKILL.md) | `/reflect` |

## Close calls (how to choose)
- **`/repro-first` vs `/replay-customer-bug`:** use `repro-first` for normal engineering bugs; use `replay-customer-bug` when starting from a customer screenshot, support ticket, call, or walkthrough (it scrubs PII and verifies booking/payment/message side effects).
- **`/pre-ship-review` vs `/council` vs `/system-audit`:** `pre-ship-review` reviews one branch with 4 lenses + skeptic; `council` adds 3 separate model families blind in parallel for high-stakes changes; `system-audit` audits the whole repository for security, scalability, and performance.
- **`/feature-fit` vs `/beta-testers`:** `feature-fit` decides *before* coding whether a UI element belongs and where it goes; `beta-testers` clicks through the built UI with real-world personas *after* coding.
- **`/correction-loop` vs `/reflect`:** `correction-loop` fixes a code/repo mistake class structurally (type, lint, check); `reflect` improves agent skills and `AGENTS.md` after a session.

## Reply rules
Lead with the direct answer, include at most one ready-to-paste prompt in a code block, and link to `https://github.com/PalmtreeBranch/frond` or the local skill file when helpful. Keep it short.
