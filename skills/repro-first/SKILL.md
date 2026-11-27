---
name: repro-first
description: "Lean bug-fix workflow for small agile teams: reproduce the bug on the real surface first, capture the smallest failing check or script that goes red without the fix, apply the minimal root-cause fix, and prove it goes green. Skips heavy test scaffolding when a focused script or browser check proves more. Use for /repro-first, fixing a bug, or writing a regression check."
disable-model-invocation: true
---

# Repro first

Every bug fix must trace to real runtime evidence, not a plausible theory. Reproduce the failure first, lock it down with the smallest honest check that fails before the fix, apply the smallest root-cause fix, and prove the same check passes.

## Workflow

### 1. Reproduce on the real surface
- Trigger the actual bug yourself (via the app's `verify-<app>` CLI, browser, API call, or focused script).
- Ask the user to reproduce **only** if a required credential, third-party webhook, or production-only state genuinely blocks local reproduction, and say exactly what blocked you.
- If the bug is elusive, binary-search the cause with targeted logging or a minimal harness until you confirm the exact mechanism.

### 2. Write the smallest failing check first
- Pick the narrowest executable check that exercises **real code** (existing test file, project invariant script, or one standalone repro script).
- Assert **observable user/caller behavior**, never internal implementation details or heavy mocks that pass even when the real bug exists.
- Run the check **before editing application code** and confirm it fails for the exact bug you are fixing.
- **Skip a permanent unit test when impractical:** if a test would require brittle mocks, massive fixture churn, or slow infra for a tiny edge case, use a focused repro script or browser verification instead; no test is better than a fake test.

### 3. Fix the root cause (smallest honest diff)
- Fix the first place the system went wrong, not a downstream bandaid guard that hides a broken invariant.
- Revert any speculative edits or debug logging that evidence did not justify.
- Keep the diff tightly scoped to this bug; file out-of-scope discoveries as separate issues.

### 4. Prove it on the same surface
- Re-run the exact check or reproduction from Step 2 and confirm it passes.
- Run the project's fast affected checks (type-check, lint, affected tests).
- If this bug represents a **repeated mistake class**, run [`../correction-loop/SKILL.md`](../correction-loop/SKILL.md) to enforce it structurally.

## Report format

- **Root cause:** 1-2 sentences with `file:line`.
- **Failing before:** exact command and observed failure output.
- **Fix:** concise summary of what changed.
- **Passing after:** exact command and passing output (plus any nearby affected checks run).
