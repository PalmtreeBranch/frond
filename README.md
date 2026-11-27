# frond

**frond** (*palm branch*, from Palmgren) is a portable skill stack for AI coding agents.

AI makes it easy to generate ten features a day and ship ten subtle bugs with them. `frond` slows down the parts that actually matter: whether a feature belongs in the product, whether real users can get through the UI without breaking it, whether independent models agree the diff is sound, and whether every repeated mistake becomes a permanent check.

Works across **Antigravity**, **Cursor**, **Claude Code**, and **Codex** from one repository.

## Skills

| Skill | When to use it | What it produces |
| --- | --- | --- |
| [`/frond-mode`](./skills/frond-mode/SKILL.md) | Starting a non-trivial task in this style | Principles, automatic skill routing, and crisp technical replies |
| [`/beta-testers`](./skills/beta-testers/SKILL.md) | Before shipping a UI change or onboarding flow | 10 context-grounded user personas clicking through the real app in parallel, merged into one developer-ready bug report |
| [`/feature-fit`](./skills/feature-fit/SKILL.md) | Before adding a feature to a dashboard/portal, or auditing a UI diff | Anti-slop placement gate: `CUT`, `DEFAULT`, `INTEGRATE`, `REPLACE`, or `NEW SURFACE` with a flow map |
| [`/locale-craft`](./skills/locale-craft/SKILL.md) | Translating UI copy, setting up a new locale, or auditing multi-language apps | Per-language style/glossary kit, native anti-slop copy, ICU/tag/length checks, and hooks into `/beta-testers` and `/feature-fit` |
| [`/create-ui-verification-skill`](./skills/create-ui-verification-skill/SKILL.md) | Repo has no safe scripted UI harness yet | Generates a project-local `verify-<app>` CLI (isolated/demo/env safety modes, doctor, CDP Chromium, feature map) that `/beta-testers` plugs into |
| [`/comment-cleanup`](./skills/comment-cleanup/SKILL.md) | Before opening a PR or after heavy AI edits | Strips slop comments and bad suppressions, flags internal surprises to refactor, and encodes real constraints structurally |
| [`/council`](./skills/council/SKILL.md) | High-stakes changes (auth, billing, tenancy, migrations, critical flows) | 3-model blind parallel review with verified finding fates and a hard 3-round cap |
| [`/pre-ship-review`](./skills/pre-ship-review/SKILL.md) | Before opening a PR that changes user-facing behavior or side effects | 4 read-only lenses (callers, sequences, blast radius, proof) + 1 skeptic + JSONL finding fates |
| [`/correction-loop`](./skills/correction-loop/SKILL.md) | After a reviewer, CI, or user catches a repeatable mistake | Fix at the highest level that holds (Architecture > Types > Check > Test > Docs) with red-without-fix proof |

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
