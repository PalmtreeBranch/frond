# frond

**frond** (*palm branch*, from Palmgren) is a portable skill stack built for **indie hackers, founders, and small agile product teams** shipping real software with Linear or GitHub Issues — without enterprise ceremony or AI slop.

AI makes it easy to generate ten features a day and ship ten subtle bugs with them. `frond` guards the whole product loop: whether a feature belongs in the UI, whether real users can get through it without breaking it, whether independent models agree the diff is sound, whether the PR actually lands live in production, and whether customers get an honest human update.

Works across **Antigravity**, **Cursor**, **Claude Code**, and **Codex** from one repository.

## Skills (16)

### Entry point
| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/frond-mode`](./skills/frond-mode/SKILL.md) | Starting a non-trivial task in this style | Principles, automatic routing across all skills, and crisp technical replies |

### Plan & shape
| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/sharpen`](./skills/sharpen/SKILL.md) | Before starting a vague idea or rough Linear/GitHub ticket | Deeper (not bigger) brief naming raw sources, cheap prototypes, and founder-only choices |
| [`/feature-fit`](./skills/feature-fit/SKILL.md) | Before adding a feature to a dashboard/portal, or auditing a UI diff | Anti-slop placement gate: `CUT`, `DEFAULT`, `INTEGRATE`, `REPLACE`, or `NEW SURFACE` with a flow map |
| [`/work-queue`](./skills/work-queue/SKILL.md) | Running through an ordered list of Linear/GitHub issues or a numbered plan | One issue per branch/PR, live status table, non-blocking blocker handling, handoff to `/land-pr` |

### Build, debug & localize
| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/repro-first`](./skills/repro-first/SKILL.md) | Fixing a bug or locking down a regression | Real-surface repro, smallest failing-then-passing check, and minimal root-cause fix |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | Checking a small-looking diff you do not fully trust | Traces past grep (DB, JSON, webhooks, queues, flags) and proves the core safety fact by running code |
| [`/locale-craft`](./skills/locale-craft/SKILL.md) | Translating UI copy, setting up a new locale, or auditing multi-language apps | Per-language style/glossary kit, native anti-slop copy, ICU/tag/length checks, and hooks into `/beta-testers`, `/feature-fit`, and `/stakeholder-reply` |

### UI verification & QA
| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/create-ui-verification-skill`](./skills/create-ui-verification-skill/SKILL.md) | Repo has no safe scripted UI harness yet | Generates a project-local `verify-<app>` CLI (isolated/demo/env safety modes, doctor, CDP Chromium, feature map) that `/beta-testers` plugs into |
| [`/beta-testers`](./skills/beta-testers/SKILL.md) | Before shipping a UI change or onboarding flow | Context-grounded user personas (default 10, configurable count and model tier: `light` / `balanced` / `deep` or exact model) clicking through the real app in parallel, merged into one developer-ready bug report |

### Clean & review
| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/comment-cleanup`](./skills/comment-cleanup/SKILL.md) | Before opening a PR or after heavy AI edits | Strips slop comments and bad suppressions, flags internal surprises to refactor, and encodes real constraints structurally |
| [`/pre-ship-review`](./skills/pre-ship-review/SKILL.md) | Before opening a PR that changes user-facing behavior or side effects | 4 read-only lenses (callers, sequences, blast radius, proof) + 1 skeptic + JSONL finding fates |
| [`/council`](./skills/council/SKILL.md) | High-stakes changes (auth, billing, tenancy, migrations, critical flows) | 3-model blind parallel review with verified finding fates and a hard 3-round cap |

### Ship, communicate & improve
| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/land-pr`](./skills/land-pr/SKILL.md) | Merging a ready PR and verifying it live in production | CI failure classification (2-round cap), SHA-pinned merge, deploy/ancestor verification, branch/worktree cleanup, exact status |
| [`/stakeholder-reply`](./skills/stakeholder-reply/SKILL.md) | Replying to a customer, partner, or colleague by email, SMS, or chat | Short human message in the recipient's language built strictly from verified facts; never sends without an explicit yes |
| [`/correction-loop`](./skills/correction-loop/SKILL.md) | After a reviewer, CI, or user catches a repeatable mistake | Fix at the highest level that holds (Architecture > Types > Check > Test > Docs) with red-without-fix proof |
| [`/reflect`](./skills/reflect/SKILL.md) | After a long or bumpy session | Mines durable learnings and routes them to targeted skill edits, `AGENTS.md`, or `/correction-loop` checks |

## Quick install

Clone the repo anywhere on your machine, then run the install script to symlink it into your active agent tools:

```bash
git clone https://github.com/hermanpalmgren/frond.git ~/Developer/frond
~/Developer/frond/scripts/install.sh all
```

Or install for one tool at a time:

```bash
~/Developer/frond/scripts/install.sh antigravity  # ~/.gemini/config/plugins/frond
~/Developer/frond/scripts/install.sh cursor       # ~/.cursor/plugins/frond
~/Developer/frond/scripts/install.sh claude       # ~/.claude/skills/*
~/Developer/frond/scripts/install.sh codex        # ~/.codex/skills/*
```

See [docs/harness.md](./docs/harness.md) for cross-tool primitive mapping and optional model configuration (`~/.config/frond/models.md`).

## Works well alongside `pstack`

`frond` complements [pstack](https://github.com/cursor/plugins/tree/main/pstack) instead of duplicating everything in it:
- Use `frond`'s `/create-ui-verification-skill` to generate a safety-bounded `verify-<app>` web harness, then drive it with `/beta-testers`'s 10 personas.
- Use `pstack`'s `/unslop` for prose cleanup and `frond`'s `/feature-fit` for product and UI anti-slop.
- Use `pstack`'s `/interrogate` for repro-only stress tests and `frond`'s `/council` + `/pre-ship-review` for multi-lens, multi-model pre-merge gates.

## Validate the repo

```bash
node scripts/validate.mjs
```

## License

[MIT](./LICENSE)
