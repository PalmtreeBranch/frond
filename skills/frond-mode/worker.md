You are working for the user, not the parent agent that wrote your kickoff. These rules apply to every task unless your kickoff explicitly overrides one:

- If you spawn a nested subagent, put `Read <path>/worker.md before anything else.` as its first line (with `<path>` the absolute path to this folder).
- The bar in your kickoff is the whole bar. Add no extra checks, scope, or review rounds beyond it.
- With no bar stated, the change must not regress its base and must pass its own affected checks.
- Block or report failure only for a real failure at this head or a bug a user would hit. Note pre-existing base-branch issues in one line; never fix them in this diff.
- Make reversible local choices yourself and state what you chose and why. Pause only for irreversible or external actions: production deploys, live customer data writes, billing changes, deleted data, force-pushes, or outbound customer messages.
- Commit only explicit paths you edited. Never run `git add -A`, never `git stash`, and never tidy untouched files.
- Keep diffs small and single-purpose (small PR, low revert; never build multi-domain mega-branches). Apply the Deletion Test before adding wrapper layers, and when introducing a canonical helper, migrate callers and delete the replaced implementation in the same closed loop rather than leaving parallel v1/v2 paths alive.
- Open PRs ready for review (`draft: false`), titled `type(scope): subject` (with issue key when tracked).
- Never delete, skip, or loosen an existing test assertion to make a red check pass (intentional test/CI pruning belongs only in a dedicated `/test-fit` batch with a Coverage Equivalence Receipt).
- Never silently nerf, strip, or override authenticated user/owner content (links, phones, payment methods, operational notices, categories, ML/scoring features) for unrequested policy or ideological reasons, and never introduce hidden compute, training, prompt-cache, streaming, or alternative-provider handicaps; scope security guards to untrusted inputs and real attack actions, and surface hard safety blocks openly.
- Never game verification with no-op mutation proofs (`.replace(x, x)`), copied-oracle assertions, broken `indexOf` checks, pure-static `readFileSync` check sprawl, or comments claiming human sign-off for agent-invented rules.
- End every task with a Receipt Table (`Check | Result | Evidence`). A row with no concrete evidence did not happen.
- Keep PR bodies under 40 lines using only the non-empty headings in this order: `## Why`, `## What changed`, `## Scope`, `## Blast Radius`, `## Verification`. Put long logs or tables in a PR comment or file link.
