# frond

I'm [Herman Palmgren](https://x.com/hpalmtreebranch), a developer and founder in Stockholm. "Palmgren" means palm branch in Swedish, which is where `frond` (and `PalmtreeBranch`) comes from.

I'm a co-founder at [VOCA](https://vocasolutions.com), where we build an AI assistant that answers phone calls, web chat, email, SMS, and social messages for local businesses and books into whatever booking system they already use. We ship it in seven languages. Before and alongside VOCA, I built a handful of bootstrapped products and tools: Tree Nerd Academy (ISA Certified Arborist exam prep, flashcards, and mock exams, built with Chris Comer), Arbster, VenturePals, and MobiLaunch (a Flutter starter kit).

## Why I built this

Most popular agent skill stacks were written for huge engineering orgs with stacked PR trains, custom internal bots, and enterprise tooling. When you are a solo founder or a small team working out of Linear or GitHub Issues, that gets in the way.

At the same time, coding with AI makes it far too easy to bolt ten extra cards onto a dashboard, ship machine-translated UI strings that clip on mobile, weaken a test to get a green check, or tell a customer a fix is live before the deploy finished.

Every skill in `frond` comes from real mistakes and real habits across VOCA and my side projects:

- Spawning 10 different user personas to click through the live app before a release (`/beta-testers`)
- Pausing before adding another card or toggle to a portal (`/feature-fit`)
- Keeping seven UI languages natural and safe from broken ICU tags (`/locale-craft`)
- Turning a customer screenshot or support call into an anonymized replay test (`/replay-customer-bug`)
- Running three separate model families blind on risky diffs (`/council`) and a two-tier security and scale sweep across the whole repo (`/system-audit`)
- Landing PRs with real deploy proof (`/land-pr`) and drafting honest human updates to customers (`/stakeholder-reply`)

One rule runs through the whole stack: **no receipt, no merge.**

`frond` runs from one repo across **Antigravity**, **Cursor**, **Claude Code**, **Codex**, and **T3 Code**. Fork it, cut what you do not use, and make it yours.

## Install

Clone the repo and symlink it into the tools on your machine:

```bash
git clone https://github.com/PalmtreeBranch/frond.git ~/Developer/frond
~/Developer/frond/scripts/install.sh all
```

Or link one tool at a time:

```bash
~/Developer/frond/scripts/install.sh antigravity  # ~/.gemini/config/plugins/frond
~/Developer/frond/scripts/install.sh cursor       # ~/.cursor/plugins/frond
~/Developer/frond/scripts/install.sh claude       # ~/.claude/skills/*
~/Developer/frond/scripts/install.sh codex        # ~/.codex/skills/*
```

Next, run `/setup-frond` inside each tool you use. It detects the models available in that runtime and saves them under a separate section in `~/.config/frond/models.md` (`## antigravity`, `## claude-code`, `## cursor`, `## codex`, `## t3-code`) so one tool never overwrites another.

For runtime primitive mapping, see [docs/harness.md](./docs/harness.md). For standing deny rules, "no-done-while-red" stop hooks, and the Receipt Table format, see [docs/guardrails.md](./docs/guardrails.md).

## Skills (21)

### Entry point and setup
| Skill | When to use it | What it does |
| --- | --- | --- |
| [`/frond-mode`](./skills/frond-mode/SKILL.md) | Starting a real task | Picks one of 5 lean playbooks (`feature`, `bug-fix`, `ui-polish`, `audit-and-harden`, `ship-queue`), passes `worker.md` to subagents, routes to the skills below, and requires a receipt table at the end |
| [`/setup-frond`](./skills/setup-frond/SKILL.md) | First run, or adding another editor/CLI | Detects available models in the active runtime and updates only its section in `~/.config/frond/models.md` |
| [`/frond-help`](./skills/frond-help/SKILL.md) | Unsure which skill fits | Checks your setup, names the right skill, and gives one prompt to paste without starting work |

### Plan and shape
| Skill | When to use it | What it does |
| --- | --- | --- |
| [`/sharpen`](./skills/sharpen/SKILL.md) | Before starting a vague idea or rough ticket | Rewrites the brief deeper (not bigger) with raw source files, cheap prototypes to run, and product calls left to you |
| [`/feature-fit`](./skills/feature-fit/SKILL.md) | Before adding a UI control, card, tab, or setting, or auditing a UI diff | Forces a placement verdict: `CUT`, `DEFAULT`, `INTEGRATE`, `REPLACE`, or `NEW SURFACE` |
| [`/work-queue`](./skills/work-queue/SKILL.md) | Running through an ordered list of Linear or GitHub issues | One issue per branch and PR, one live status table, skips blocked items without stalling independent ones, hands finished PRs to `/land-pr` |

### Build, debug, and localize
| Skill | When to use it | What it does |
| --- | --- | --- |
| [`/repro-first`](./skills/repro-first/SKILL.md) | Fixing a bug | Reproduces on the real surface first, writes the smallest failing-then-passing check, and ships the minimal root-cause fix |
| [`/replay-customer-bug`](./skills/replay-customer-bug/SKILL.md) | Starting from a customer screenshot, support report, call, or walkthrough | Strips personal data, replays through the normal product flow before and after the fix, and checks whether any booking, payment, or message fired |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | Checking a small diff you do not fully trust | Traces past grep (DB columns, API JSON, webhooks, queues, flags) and proves the core safety fact by running code |
| [`/strongman`](./skills/strongman/SKILL.md) | Pushing a stuck non-sensitive task through when an agent loops or stalls | Spawns a fresh model or provider for a different angle and drives every allowed tool (shell, browser, tests) to a verified finish |
| [`/locale-craft`](./skills/locale-craft/SKILL.md) | Translating UI copy, adding a locale, or auditing multi-language apps | Builds per-language glossaries and style guides, catches translationese and ICU/tag/length bugs, and feeds locale checks into `/beta-testers` and `/feature-fit` |

### UI verification and QA
| Skill | When to use it | What it does |
| --- | --- | --- |
| [`/create-ui-verification-skill`](./skills/create-ui-verification-skill/SKILL.md) | Repo has no safe scripted browser harness yet | Builds a project-local `verify-<app>` CLI with `isolated`/`demo`/`env` safety modes, `doctor`, persistent headless Chromium, and a feature map |
| [`/beta-testers`](./skills/beta-testers/SKILL.md) | Before shipping a UI change or onboarding flow | Launches context-grounded user personas (default 10, configurable count and `light`/`balanced`/`deep` model tier) to click through the live app and return one reproducible bug report |

### Clean and review
| Skill | When to use it | What it does |
| --- | --- | --- |
| [`/comment-cleanup`](./skills/comment-cleanup/SKILL.md) | Before opening a PR or after heavy AI edits | Deletes slop comments and unsafe lint/TS suppressions, flags internal workarounds to refactor, and proposes checks for claimed constraints |
| [`/pre-ship-review`](./skills/pre-ship-review/SKILL.md) | Before opening a PR that changes user-facing behavior or side effects | Runs 4 read-only lenses (callers, sequences, blast radius, anti-cheating test integrity) plus 1 skeptic and JSONL finding fates |
| [`/council`](./skills/council/SKILL.md) | High-stakes changes (auth, billing, tenancy, migrations, critical flows) | 3-model blind parallel review with verified finding fates and a hard 3-round cap |
| [`/system-audit`](./skills/system-audit/SKILL.md) | Full security, scalability, and performance audit (or `--scope diff` sweep) | 6 parallel mid-tier explorers plus a larger flagship Chief Auditor/Skeptic pass, ranked by Severity x Likelihood (`P0` to `P3`) and Effort |

### Ship, communicate, and improve
| Skill | When to use it | What it does |
| --- | --- | --- |
| [`/land-pr`](./skills/land-pr/SKILL.md) | Merging a ready PR and confirming it is live | Classifies CI failures (2-round cap), pins merge to the checked head SHA, verifies live deploy via ancestor check, cleans up branches/worktrees, and reports exact state |
| [`/stakeholder-reply`](./skills/stakeholder-reply/SKILL.md) | Drafting an email, SMS, or chat reply to a customer, partner, or colleague | Short human message in the recipient's language built strictly from verified session facts; never sends without an explicit yes in the current turn |
| [`/correction-loop`](./skills/correction-loop/SKILL.md) | After a reviewer, CI, or user catches a repeated mistake | Fixes at the highest level that holds (Architecture > Types > Lint/Check > Behavioral test > Docs) with red-without-fix proof |
| [`/reflect`](./skills/reflect/SKILL.md) | After a long or bumpy session | Mines durable lessons and proposes edits to `frond`, `AGENTS.md`, or `/correction-loop` |

## Using `frond` with `pstack`

I use parts of Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) alongside `frond`, and several ideas here were inspired by it. They sit next to each other cleanly: `pstack`'s `/unslop` cleans up writing while `frond`'s `/feature-fit` stops UI clutter; `pstack`'s `/interrogate` stress-tests a diff while `frond`'s `/council` and `/pre-ship-review` gate risky merges.

## Validate the repo

```bash
node scripts/validate.mjs
```

## License

[MIT](./LICENSE)
