<img src="./assets/logo.png" alt="frond logo" width="80" height="80" />

# frond

[![Validate & Security Audit](https://github.com/PalmtreeBranch/frond/actions/workflows/ci.yml/badge.svg)](https://github.com/PalmtreeBranch/frond/actions/workflows/ci.yml)

I'm Herman Palmgren ([X](https://x.com/palmgren_herman), [YouTube](https://www.youtube.com/@HermanPalmgren), [TrustMRR](https://trustmrr.com/founder/hpalmtreebranch)), a founder and developer in Stockholm. "Palmgren" means palm branch in Swedish, which is where `frond` (and `PalmtreeBranch`) comes from.

I co-founded [VOCA](https://vocasolutions.com), where we build an AI receptionist that handles phone calls, chat, email, SMS, and social messages for local businesses and books into their existing systems, in seven languages. Before and alongside VOCA, I built and ran a bunch of bootstrapped businesses and apps: [Arboristbutiken](https://arboristbutiken.se) (arborist and tree-climbing gear e-commerce in Sweden), [Tree Nerd Academy](https://www.treenerdacademy.com) (ISA Certified Arborist exam prep with Chris Comer), VenturePals, [FrondFrame](https://frondframe.io), [MobiLaunch](https://mobilaunch.io), and several mobile apps including [ISA Flashcards](https://isaflashcards.com), [Arbster](https://apps.apple.com/app/arbster/id1661608920), [Steady](https://apps.apple.com/app/steady-fear-of-flying/id6764277758), and [Pouch Quit](https://apps.apple.com/us/app/pouch-quit-quit-nicotine/id6566173079).

Across my projects, this workflow lets me push and merge 300+ PRs a day with a <0.25% revert rate, backed by 1,100+ automated invariant checks across 336 API routes and 7 UI languages on VOCA alone.

## Why frond exists

AI coding agents are fast, and they are reckless.

Leave an agent alone for ten minutes and it will happily bolt four extra cards onto your dashboard, weaken a test to make CI turn green, break a webhook three files away, ship machine-translated Dutch that clips off a mobile screen, and tell you "it's fixed in production" before the deploy even ran.

Most popular skill stacks solve this for huge engineering orgs with stacked PR trains and internal bots. If you are an indie hacker or a small team living in Linear or GitHub Issues, that is way too much ceremony.

`frond` is the set of small, composable skills I actually use every day to stop slop and breaking changes without slowing down:

- **Stop UI slop and wasted work before it gets written.** [`/business-value`](./skills/business-value/SKILL.md) checks real usage (PostHog, GA, DB) and your 1-3 month growth trajectory before you spend days building something nobody needs, or helps you decide whether to keep pushing when stuck. [`/feature-fit`](./skills/feature-fit/SKILL.md) pauses before you add another card, tab, or toggle to a portal and asks if it should just be a smart default, live inline, replace something old, or get cut.
- **Catch real-user breakage before customers do.** [`/beta-testers`](./skills/beta-testers/SKILL.md) is my favourite skill in the whole stack. It spins up 10 realistic user personas (a 62-year-old who hates tech, a mobile-first thumb scroller, a double-clicker, a dark-mode skeptic, and more) to click through your actual app and hand back one reproducible bug report.
- **Stop sneaky breaking changes, silent nerfs, and fake green tests.** [`/blast-radius`](./skills/blast-radius/SKILL.md) traces past grep and proves safety by running real code. [`/pre-ship-review`](./skills/pre-ship-review/SKILL.md) runs 4 read-only lenses plus a skeptic and flags silent product nerfing, cache/compute walls, and weakened or gamed tests. [`/nerf-audit`](./skills/nerf-audit/SKILL.md) runs a cross-provider forensic audit (a different model family than the code author) for Notes-App over-blocking, compute/training/cache slowdowns, rival-provider handicapping, and review bureaucracy. [`/council`](./skills/council/SKILL.md) puts 3 different model families on a risky diff blind with equal context fidelity.
- **Turn real bugs and repeat mistakes into permanent checks.** [`/replay-customer-bug`](./skills/replay-customer-bug/SKILL.md) turns a support screenshot or call into an anonymized replay test. [`/correction-loop`](./skills/correction-loop/SKILL.md) fixes repeated mistakes at the highest level that holds (architecture, types, lint, test, docs last).
- **Ship honestly.** [`/land-pr`](./skills/land-pr/SKILL.md) pins merges to the checked commit SHA and verifies the live deploy before anyone says "live". [`/stakeholder-reply`](./skills/stakeholder-reply/SKILL.md) drafts a short human update from verified facts only and never sends without your yes.
- **Keep one rule over all of it: no receipt, no merge.**

Works from one repo across **Antigravity**, **Cursor**, **Claude Code**, **Codex**, **T3 Code**, **OpenCode**, **GitHub Copilot**, **Windsurf**, **Gemini CLI**, and any other Agent Skills runtime. Fork it, strip out whatever you do not need, and make it yours.

## Get started

Two steps:

1. Clone and symlink `frond` into your tools:

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
~/Developer/frond/scripts/install.sh opencode     # ~/.config/opencode/skills/*
~/Developer/frond/scripts/install.sh copilot      # ~/.copilot/skills/*
~/Developer/frond/scripts/install.sh windsurf     # ~/.codeium/windsurf/skills/*
~/Developer/frond/scripts/install.sh gemini-cli   # ~/.gemini/skills/*
```

2. Run [`/setup-frond`](./skills/setup-frond/SKILL.md) inside each tool you use. It detects only the models available in that runtime and saves them to its own section in `~/.config/frond/models.md` (`## antigravity`, `## claude-code`, `## cursor`, `## codex`, `## t3-code`, `## opencode`, `## copilot`, `## windsurf`, `## gemini-cli`, or any custom runtime name) so your Claude Code setup never clobbers your OpenCode, T3 Code, or Cursor setup.

Not sure which skill to run? Ask [`/frond-help`](./skills/frond-help/SKILL.md).

## How it looks in practice

Mostly I start with [`/frond-mode`](./skills/frond-mode/SKILL.md), which picks one of 5 lean playbooks (`feature`, `bug-fix`, `ui-polish`, `audit-and-harden`, `ship-queue`), hands `worker.md` to subagents, and routes to the right skills as needed. You can also call any skill directly:

```text
worth building?:    /business-value check if VOC-142 is worth finishing or if we should cut it
anti-slop UI gate:  /feature-fit should we add a new status card to the portal home?
live persona QA:    /beta-testers 10 personas on balanced focusing on /onboarding
quick smoke QA:     /beta-testers 4 personas on deep on the new billing modal
risky small diff:   /blast-radius check what changing this webhook payload could break
customer bug:       /replay-customer-bug turn this support screenshot into a replay test
multi-model review: /council review this auth migration before opening the PR
full system audit:  /system-audit full --explorers balanced --chief deep
cross-provider nerf:/nerf-audit audit this AI-authored branch for silent nerfs, cache/compute walls, and fake proofs
fast diff sweep:    /system-audit --scope diff
run an issue list:  /work-queue do VOC-120, VOC-124, and VOC-129 in order to PR open
ship it cleanly:    /land-pr merge when green and verify live
customer update:    /stakeholder-reply draft a short Swedish email to Anna saying it is live
climb an eval/fix:  /hill-climb get the booking eval above 95% and stop if gains plateau
unstick a loop:     /strongman push this local Playwright setup over the finish line
```

## All 24 skills

<details>
<summary>Open the full skill list</summary>

### Entry point and setup
| Skill | Use it when | What it does |
| --- | --- | --- |
| [`/frond-mode`](./skills/frond-mode/SKILL.md) | Starting any non-trivial task | Picks one of 5 playbooks, propagates `worker.md` to subagents, routes skills, and enforces grounding receipts plus a final receipt table |
| [`/setup-frond`](./skills/setup-frond/SKILL.md) | First run or adding another tool | Detects models in any active runtime (Antigravity, Claude Code, Cursor, Codex, T3 Code, OpenCode, Copilot, Windsurf, Gemini CLI, or custom) and updates only its section in `~/.config/frond/models.md` |
| [`/frond-help`](./skills/frond-help/SKILL.md) | Picking a skill or checking setup | Checks local setup, maps your task to a skill, and hands back one prompt without starting work |

### Plan and shape
| Skill | Use it when | What it does |
| --- | --- | --- |
| [`/business-value`](./skills/business-value/SKILL.md) | Prioritizing an idea/issue, or deciding whether to keep going when stuck | Checks real usage analytics (PostHog, GA, DB) and 1-3 month growth trajectory, then returns `BUILD NOW`, `BUILD NOW (CRITICAL FIX)`, `BUILD NOW FOR UPCOMING SCALE`, `SIMPLIFY`, `DEFER`, or `SKIP / STOP` |
| [`/sharpen`](./skills/sharpen/SKILL.md) | Starting from a vague idea or rough ticket | Rewrites the brief deeper (not bigger) with raw source files, cheap prototypes to run, and product calls left to you |
| [`/feature-fit`](./skills/feature-fit/SKILL.md) | Before adding a UI card, tab, or toggle, or auditing a UI diff | Forces a placement verdict: `CUT`, `DEFAULT`, `INTEGRATE`, `REPLACE`, or `NEW SURFACE` |
| [`/work-queue`](./skills/work-queue/SKILL.md) | Working through an ordered Linear or GitHub issue list | One issue per branch and PR, one live status table, skips blocked items without stalling independent ones, hands PRs to `/land-pr` |

### Build, debug, and localize
| Skill | Use it when | What it does |
| --- | --- | --- |
| [`/repro-first`](./skills/repro-first/SKILL.md) | Fixing a bug | Reproduces on the real surface first, writes the smallest failing-then-passing check, and ships the minimal root-cause fix |
| [`/hill-climb`](./skills/hill-climb/SKILL.md) | Pushing a low eval score, perf metric, or stubborn bug until gains plateau | Sets a frozen baseline and definition of done, loops one hypothesis at a time (keep or revert), pivots at plateaus, and stops cleanly when incremental gains run out |
| [`/replay-customer-bug`](./skills/replay-customer-bug/SKILL.md) | Starting from a customer screenshot, support report, call, or walkthrough | Strips personal data, replays through the normal product flow before and after the fix, and checks bookings, payments, and outbound messages |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | Checking a small diff you do not fully trust | Traces past grep (DB columns, API JSON, webhooks, queues, flags) and proves the core safety fact by running code |
| [`/strongman`](./skills/strongman/SKILL.md) | An agent is looping or stalling on a non-sensitive task | Spawns a fresh model or provider for a different angle and drives every allowed tool (shell, browser, tests) to a verified finish |
| [`/locale-craft`](./skills/locale-craft/SKILL.md) | Translating UI copy, adding a locale, or auditing multi-language apps | Builds per-language glossaries and style guides, catches translationese and ICU/tag/length bugs, and feeds locale checks into `/beta-testers` and `/feature-fit` |

### UI verification and QA
| Skill | Use it when | What it does |
| --- | --- | --- |
| [`/create-ui-verification-skill`](./skills/create-ui-verification-skill/SKILL.md) | A web app has no safe scripted browser harness yet | Builds a project-local `verify-<app>` CLI with `isolated`/`demo`/`env` safety modes, `doctor`, persistent headless Chromium, and a feature map |
| [`/beta-testers`](./skills/beta-testers/SKILL.md) | Before shipping a UI change or onboarding flow | Launches context-grounded user personas (default 10, configurable count and `light`/`balanced`/`deep` model tier) to click through the live app and return one reproducible bug report |

### Clean and review
| Skill | Use it when | What it does |
| --- | --- | --- |
| [`/comment-cleanup`](./skills/comment-cleanup/SKILL.md) | Before opening a PR or after heavy AI edits | Deletes slop comments and unsafe lint/TS suppressions, flags internal workarounds to refactor, and proposes checks for claimed constraints |
| [`/pre-ship-review`](./skills/pre-ship-review/SKILL.md) | Before opening a PR that changes user-facing behavior or side effects | Runs 4 read-only lenses (callers, sequences, blast radius + Notes-App/nerf check, anti-cheating/anti-gaming proof) plus 1 cross-provider-preferred skeptic, stateful 3-round cap, and JSONL finding fates |
| [`/council`](./skills/council/SKILL.md) | High-stakes changes (auth, billing, tenancy, migrations, critical flows) | 3-model blind parallel review with equal context fidelity, no single-provider sole judge, verified finding fates, and a stateful hard 3-round cap |
| [`/nerf-audit`](./skills/nerf-audit/SKILL.md) | Auditing AI-authored branches or pipelines for silent nerfs and slowdowns | Strictly read-only cross-provider forensic audit (different model family than the author) for Notes-App over-blocking, compute/training/cache walls, rival-provider handicapping, check gaming, and review bureaucracy |
| [`/system-audit`](./skills/system-audit/SKILL.md) | Full security, scalability, performance, and AI-integrity audit (or `--scope nerfs` / `--scope diff`) | 7 parallel mid-tier explorers (including cross-provider Slice 7) plus a larger flagship cross-provider Chief Auditor/Skeptic pass, ranked by Severity x Likelihood (`P0` to `P3`) and Effort |

### Ship, communicate, and improve
| Skill | Use it when | What it does |
| --- | --- | --- |
| [`/land-pr`](./skills/land-pr/SKILL.md) | Merging a ready PR and confirming it is live | Classifies CI failures (2-round cap), pins merge to the checked head SHA, verifies live deploy via ancestor check, cleans up branches/worktrees, and reports exact state |
| [`/stakeholder-reply`](./skills/stakeholder-reply/SKILL.md) | Drafting an email, SMS, or chat reply to a customer, partner, or colleague | Short human message in the recipient's language built strictly from verified session facts; never sends without an explicit yes in the current turn |
| [`/correction-loop`](./skills/correction-loop/SKILL.md) | After a reviewer, CI, or user catches a repeated mistake | Fixes at the highest level that holds (Architecture > Types > Lint/Check > Behavioral test > Docs) with red-without-fix proof |
| [`/reflect`](./skills/reflect/SKILL.md) | After a long or bumpy session | Mines durable lessons and proposes edits to `frond`, `AGENTS.md`, or `/correction-loop` |

</details>

## Guardrails and cross-tool notes

- [docs/harness.md](./docs/harness.md): primitive and model-tier mapping across Antigravity, Cursor, Claude Code, Codex, and T3 Code.
- [docs/guardrails.md](./docs/guardrails.md): standing deny rules, "no-done-while-red" stop hooks (so agents cannot claim finished while tests are failing), the Receipt Table format, and anti-nerfing, compute-integrity, and cross-provider auditing rules.

## Inspiration

Big thanks to Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Matt Pocock's [skills](https://github.com/mattpocock/skills). Both shaped how I think about making coding agents less reckless. `frond` sits nicely alongside them if you already use either one.

## Trust and security audit

You should never blindly install random agent skills from the internet. `frond` ships plain text only (zero npm dependencies, zero compiled binaries, zero network-calling scripts), and GitHub Actions runs an automated security audit on every commit.

Run both checks yourself before symlinking anything:

```bash
node scripts/validate.mjs
node scripts/security-audit.mjs
```

`validate.mjs` checks all manifests, skill frontmatter, relative links, and bans em dashes. `security-audit.mjs` checks every file for hidden zero-width/bidi Unicode, hidden HTML comments, remote shell pipes, secret shapes, unallowlisted URLs, script network calls, and required safety guardrails across high-impact skills. See [SECURITY.md](./SECURITY.md) for details.

## License

[MIT](./LICENSE)
