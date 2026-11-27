---
name: comment-cleanup
description: "Ruthlessly audit and clean comments, dead commented-out code, workaround sermons, and unjustified lint/TypeScript suppressions before review; flag our-code surprises for refactoring and propose structural encodings for claimed constraints. Use for /comment-cleanup or before opening a pull request."
disable-model-invocation: true
---

# Comment cleanup

AI coding agents leave narration comments, section banners, commented-out code, and long apologies for workarounds. Clean them before review, and turn real constraints into code instead of prose warnings.

Read [`../../docs/harness.md`](../../docs/harness.md) when spawning the auditor subagent.

## Scope

Use the files or range the caller named. Otherwise use the current branch diff against the base branch (`main` or the repo's integration branch), including the working tree. Never touch files outside scope.

## The strict keep-list

Only five comment categories survive. If a comment does not clearly match one of these five, delete it:

1. **Legal or license headers.**
2. **External/foreign gotchas we cannot reshape:** non-obvious behavior forced by a third-party library, browser quirk, vendor API, or protocol, verified to still hold on a live path.
3. **Style-only formatter/linter pragmas:** `prettier-ignore` or a verified style-only lint suppression. Correctness, security, and type-safety suppressions (`@ts-ignore`, `@ts-expect-error`, `eslint-disable` on bug-catching rules) do **not** qualify.
4. **Public API contracts:** JSDoc/TSDoc documenting an exported library or SDK contract.
5. **Issue, RFC, or spec links** explaining an external business or compliance constraint that code cannot express on its own.

Everything else dies:
- Narration ("fetch the user", "loop over items", "return result")
- Decorative banners (`// === Helpers ===`)
- Commented-out dead code (git keeps history)
- Workaround sermons (`// IMPORTANT: do not remove`, `// hack`, `// fine for now`, `// temporary`)
- Explanations of confusing **internal** code (flag the code to rename, extract, or type instead!)

---

## Step 1: Run a fresh comment-auditor pass

Spawn one fresh subagent scoped strictly to the target files/diff with this rule: **edit comments only (never alter executable application logic)** and return a report with:
- Files touched and total comment deletions
- **`REFACTOR` flags**: symbols in our own code where a deleted comment was papering over confusing naming, a workaround, or a correctness/type suppression (`@ts-ignore`, `@ts-expect-error`, safety `eslint-disable`)
- **`ENCODE` flags**: constraint comments (`do not remove`, `must stay in this order`, `keep in sync with X`) that claim an invariant nothing enforces
- **Kept comments**: each surviving comment and which keep-list clause (1-5) justified it

Before deleting or keeping any `IMPORTANT` / `do not remove` comment, the auditor must read surrounding code and trace the named symbol (or check `git log -S` / blame) so a real external constraint is never blindly deleted and a dead superstition is never kept.

---

## Step 2: Parent verification

Inspect the subagent's diff and report carefully:
1. **Reject** any edit to application logic, any edit outside scope, or any deleted keep-list item. Revert and re-run once if the subagent violated scope or touched logic.
2. **Audit every kept comment:** if a kept comment is actually about our own code or lacks proof of a live external constraint, delete it and add a `REFACTOR` or `ENCODE` flag.
3. **Audit missed suppressions:** grep the scoped diff for `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `biome-ignore`, `noqa`, `# type: ignore`. Any suppression hiding a real correctness or safety check becomes a `REFACTOR` flag.

---

## Step 3: Act on `REFACTOR` and `ENCODE` flags

- **Trivial `REFACTOR` flags** (drop unused param, rename confusing helper, replace workaround with the real API, fix the real type instead of `@ts-expect-error`): implement the smallest in-scope root-cause fix directly. Never bolt on a new symptom guard.
- **Non-trivial `REFACTOR` flags** that cross module boundaries outside scope: leave out-of-scope files untouched and list them clearly as follow-up work.
- **`ENCODE` flags** (claimed constraints like "must stay sorted" or "keep in sync"): apply [`../correction-loop/SKILL.md`](../correction-loop/SKILL.md); propose the cheapest in-scope type, runtime assertion, invariant check, or lint rule.
  - If the user approves (or pre-approved encoding), add the structural check, prove it fails without the constraint, and delete the comment.
  - Otherwise delete the unenforced comment only if safe, or report the constraint explicitly open with the proposed check.

---

## Step 4: Report

Return one compact summary:
- Comments deleted (count + files)
- Comments kept (count + keep-list reason)
- `REFACTOR` items fixed vs left open (with file:line)
- `ENCODE` items encoded vs proposed (with file:line)
- Verification run (type-check / lint / affected checks passed after edits)
