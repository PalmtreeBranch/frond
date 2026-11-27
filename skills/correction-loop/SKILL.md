---
name: correction-loop
description: "Turn a repeated mistake caught by a user, reviewer, or CI into a permanent structural fix at the highest level that holds (Architecture > Types > Static check/Lint > Behavioral test > Docs), proven with a red-without-fix check and logged in a concise corrections ledger. Use for /correction-loop, when corrected on a repeatable mistake, or to mine recent PR history for recurring failure classes."
---

# Correction loop

When a user, reviewer, or CI corrects a mistake, fixing the one line is only half the job. The other half is making sure no agent or human repeats that mistake class next week.

## The five-level enforcement ladder

Fix every mistake class at the **highest level that holds**, in strict order:

1. **Architecture**: make the wrong thing impossible to write (one shared helper, one boundary module, one read-time default instead of scattered flags).
2. **Types**: make the compiler refuse it (branded types, discriminated unions, exhaustive switches, Zod/schema parsing at boundaries).
3. **Static check / Lint**: fail CI with an error message that names the exact helper or pattern to use instead. If legacy code already violates the rule, add a per-file baseline ratchet so existing count can only go down and new violations fail immediately.
4. **Behavioral test**: run the real code path and assert the observable wrong outcome fails.
5. **Docs**: last resort (`AGENTS.md`, `CORRECTIONS.md`). Docs never fail CI, so use level 5 only when levels 1-4 genuinely cannot express the rule, and state why.

---

## Mode A: After a correction (default)

1. **Fix the immediate bug first** on its root cause (never a bandaid guard that hides a broken invariant).
2. **Name the mistake class**, not the file name. Good: *"Guest or model free text reaches a notification subject line."* Bad: *"Forgot to sanitize `mail.ts` line 42."*
3. **Check if it has happened twice** (or is a high-impact failure class worth pinning on occurrence #1, such as security, billing, or data loss). Search git log / PR history quickly to see if other files share the same pattern.
4. **Climb the ladder (1 -> 5)** and implement the highest enforcement level that holds in the same change.
5. **Run the red-without-fix proof (mandatory for levels 3-4):**
   - Temporarily re-introduce the broken version (or test against the old commit / mutated source).
   - Run the new check and observe it **fail** for the exact expected reason.
   - Restore the fix and observe the check **pass**.
   - Record the failing message as your proof. A check that passes without the fix is vacuous and proves nothing.
6. **Update the repo's corrections ledger** (`docs/agents/corrections.md` if present, otherwise `CORRECTIONS.md`) with one row:

```markdown
| Class | Occurrences | Level | Enforced by | Proof |
| --- | --- | --- | --- | --- |
| <mistake class> | <PR/issue/SHA links> | <Architecture / Types / Check / Behavioral test / Docs> | <exact helper, type, or check command> | <red-without-fix failure observed> |
```

7. **Prune obsolete rows:** whenever a refactor eliminates the underlying mechanism so the mistake class can no longer exist, delete its row from the ledger.

---

## Mode B: History mining audit (`/correction-loop mine`)

When asked to mine recurring mistakes from recent work:
1. Inspect the last 30-60 days of merged PRs, revert commits, review threads, and CI fixup commits (`git log --grep="fix" --grep="revert" --oneline`).
2. Cluster fixes into concrete mistake classes (keep only classes with 2+ real occurrences).
3. Rank classes by impact x frequency.
4. For the top 3-5 classes, propose the highest enforcement level (1-4) and let the user pick which ones to implement first.
