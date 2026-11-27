---
name: test-fit
description: "Critically audit and reshape CI workflows and test suites using small-PR, low-revert closed-loop batches: finds bypassable CI gates and vacuous/mock-tautology tests, adds missing behavioral tests on unprotected critical paths, merges scattered per-PR check sprawl, deletes redundant or obsolete checks with a Coverage Equivalence Receipt, and speeds up slow suites with measured wall-clock proof. Use for /test-fit, auditing CI or unit tests, trimming redundant tests, fixing test gaps, or speeding up slow test runs."
---

# Test fit (CI & test suite audit, pruning, gap-filling, and speedup)

Agents make it effortless to append one more unit test and one more CI script on every PR. Left unchecked, a repo ends up with slow CI, dozens of brittle `readFileSync` source-grep scripts, duplicate tests asserting the same thing five ways, bypassable workflows that silently pass, and critical production flows that *still* have zero real behavioral coverage.

**Core mental model ("Day 1 suite with full hindsight"):**
Assume today is day one of the product, knowing every real production failure mode, security boundary, and business contract. Ask: *what is the smallest, fastest, un-bypassable set of CI gates and behavioral tests that catches every real regression?* Converge toward that suite one **small, independently mergeable PR** at a time.

Read [`../../docs/harness.md`](../../docs/harness.md) for runtime primitives and [`../frond-mode/worker.md`](../frond-mode/worker.md) for PR size and receipt rules.

---

## Hard rules

1. **Never delete a failing test to make CI green.** If an existing test is red, treat it as a real bug until proven otherwise. Never mix opportunistic test deletion into a feature or bug-fix PR.
2. **Require a Coverage Equivalence Receipt before deleting or merging any test.** Before removing a test or check, prove in writing (and by mutation when behavioral) that either:
   - Another behavioral test (`file:line`) still fails when the underlying production invariant is broken,
   - The invariant is now strictly enforced higher on the ladder (compiler/types or architecture per [`../correction-loop/SKILL.md`](../correction-loop/SKILL.md)), or
   - The tested feature/code path was intentionally removed.
3. **Patch holes before shrinking the net.** Always fix CI bypasses (`HARDEN`) and critical missing coverage (`ADD MISSING`) *before* pruning redundant tests (`DELETE` / `CONSOLIDATE`).
4. **Measure speed; never guess.** Record wall-clock timing before and after every `SPEED UP` change.
5. **Small PRs, low reverts.** Never rewrite the entire test suite or all CI workflows in one giant branch. Ship one focused closed-loop batch = one isolated branch/worktree = **one small, independently mergeable PR** (default `--batches 3` per run).

---

## Every check gets one of 6 verdicts

Evaluate every CI workflow job, standalone check script, and test file/describe block against six explicit verdicts:

| Verdict | When it applies | Required action |
| --- | --- | --- |
| **`KEEP`** | Fast, un-bypassable behavioral test or CI gate protecting a real user, data, billing, or security invariant | Leave untouched; record in the strong-controls baseline |
| **`HARDEN`** | Intended to guard a real risk, but can be bypassed in CI or passes vacuously when production code is broken | Close the bypass / fix the vacuous assertion and prove red-without-fix |
| **`ADD MISSING`** | High-risk or high-churn production path, sequence, or boundary has zero behavioral coverage | Add a minimal behavioral test inside the canonical domain suite and prove red-without-fix |
| **`SPEED UP`** | Valid coverage paying avoidable `sleep`, repeated boot/seed, serial-process, or E2E-for-unit-logic overhead | Refactor for speed while preserving exact behavioral assertions; record before/after runtime |
| **`CONSOLIDATE`** | Scattered per-PR test files (`pr-142.test.ts`), duplicate setup flows, or standalone `readFileSync` source-grep scripts testing one domain | Fold into one canonical domain suite (or promote to Type/Lint) and delete the scattered files in the same closed loop |
| **`DELETE`** | Dead-code test, mock-self tautology (asserts what its own mock returned), brittle implementation-detail check with zero user signal, or 100% subsumed by a stronger check | Delete with an explicit **Coverage Equivalence Receipt** |

---

## Inputs & modes

- **Mode:**
  - `--plan` (read-only): inspect CI workflows, timings, bypass paths, redundancy, and coverage gaps; return the ranked batch plan without editing files.
  - Default (execute): run Phase 1 (read-only audit), then execute up to `--batches N` small closed-loop PRs.
- **Scope:** repo-wide CI + tests (default) or a target path/workflow (for example `--scope .github/workflows`, `--scope tests/billing`, or `--scope scripts/`).
- **Batch budget:** default `3` small PRs per run (`--batches N` to adjust).

---

## Phase 1: Read-only CI & Test Audit

Inspect workflows, package scripts, check runners, test files, and recent `git log` hotspots before editing anything:

### 1. Bypass & blind-spot audit ("Can this be bypassed?")
- **CI workflow bypasses:**
  - Test files or `scripts/check-*` files on disk that are **never executed** by any CI workflow or `npm test` / `pytest` glob
  - `continue-on-error: true`, `|| true`, or swallowed exit codes hiding red checks
  - Overly narrow `paths:` / `paths-ignore:` triggers where editing shared `lib/`, `packages/`, schemas, or configs skips downstream test jobs
  - Branch/event filters that skip pull requests targeting active integration branches
  - Conditional skips (`if (!process.env.X) return`) where missing CI env vars make an entire suite pass with 0 assertions run
- **Test-level vacuity & gaming:**
  - Tests mocking the exact unit, DB query, or guard under test so production bugs cannot fail the test
  - Literal no-op mutation proofs (`.replace(x, x)`), copied-oracle assertions (pasting production code into the test), or broken `indexOf` order checks where `-1` passes
  - `.skip`, `.todo`, commented-out `expect`s, or assertions inside unawaited async callbacks / `try-catch` blocks that never fail the runner

### 2. Signal quality & excess audit ("Is it good, redundant, or unneeded?")
- Flag **pure-static `readFileSync` theater**: standalone scripts grepping source strings instead of importing and running production code (keep static scans only for genuine repo-wide conventions consolidated into one baseline-ratcheted linter).
- Flag **per-PR file sprawl**: dozens of tiny single-issue test files belonging inside one cohesive domain test file.
- Flag **pyramid inversions & duplicate journeys**: multiple slow browser/E2E tests booting the whole app just to check pure validation/formatting branches that 1 table-driven unit test covers in 5ms.
- Flag **fragile implementation coupling**: assertions on internal private helper call counts, exact internal log text, or internal state shapes that break during safe refactors without catching user-visible bugs.

### 3. Coverage gap audit ("What critical behavior is unprotected?")
- Compare high-churn / high-impact production modules (`git log --since="60 days ago"`, auth/tenancy/RLS routes, billing/webhooks, booking/message side effects, retry/concurrency paths) against real behavioral tests.
- List concrete **unprotected failure modes** where deleting a guard, tenant filter, idempotency check, or branch today leaves the entire test suite green.

### 4. Runtime & efficiency profile ("Why is it slow?")
- Measure actual wall-clock durations locally or from recent CI logs (never guess):
  - Hardcoded `sleep` / `waitForTimeout` calls instead of deterministic polling or fake timers
  - Per-test server/DB/browser cold boots instead of shared worker setup or transaction rollbacks
  - Spawning dozens of separate Node/Python child processes serially instead of one in-process runner or parallel shard
  - Missing dependency/build caching or redundant typecheck/lint/build steps duplicated across CI jobs

### 5. Ranked batch queue
Rank proposed closed-loop batches in strict safety order:
1. **`HARDEN` + `ADD MISSING`** on critical paths (close CI bypasses and unprotected high-risk gaps first)
2. **`SPEED UP`** on the largest measured wall-clock bottlenecks
3. **`CONSOLIDATE` + `DELETE`** on high-noise duplicate/theater suites (one domain per small PR)

If invoked with `--plan`, output the CI & Suite Map, measured timings, and ranked batch table, then stop.

---

## Phase 2: Closed-loop execution (1 batch = 1 branch = 1 small PR)

For each batch (up to `--batches N`), start from a clean branch/worktree off `origin/main`:

1. **For `HARDEN` and `ADD MISSING` batches:**
   - Fix the CI trigger/exit-code bypass or write the missing behavioral test inside the canonical domain suite (never create a new `pr-xyz.test.ts` file when a domain suite exists).
   - **Mandatory red-without-fix proof:** temporarily break the target production guard or re-introduce the bypass, run the check, and observe it **fail** for the exact expected reason; restore production code and observe it **pass**.
2. **For `SPEED UP` batches:**
   - Record baseline command + wall-clock runtime (`before_ms`).
   - Replace sleeps, serial spawns, or repeated cold boots while keeping behavioral assertions intact.
   - Record post-change runtime (`after_ms`) and verify mutation failure still triggers on a representative assertion.
3. **For `CONSOLIDATE` and `DELETE` batches:**
   - Build the **Coverage Equivalence Receipt** table *before* deleting any file or test block:
     `Removed Check | Original Intent | Surviving Protection (file:line or Type/Lint rule) | Mutation Proof`
   - Merge worth-keeping behavioral cases into the canonical domain suite, delete the redundant/sprawl files, and update `package.json` / CI globs cleanly so zero broken script references remain.
   - Temporarily break one core behavior covered by the consolidated suite to confirm it fails cleanly, then restore.
4. **Verify & ship small:**
   - Run the affected suite + full fast CI gate locally.
   - When `pre-ship-review` inspects a `/test-fit` PR, include the **Coverage Equivalence Receipt** in the PR body (`## Verification`) so intentional pruning is distinguished from test-cheating.
   - Open one small ready PR (<40-line body + Receipt Table) and hand off to [`../land-pr/SKILL.md`](../land-pr/SKILL.md) (or continue via [`../work-queue/SKILL.md`](../work-queue/SKILL.md)). Stop if 2 test/CI rounds fail on a batch or the `--batches` budget is reached.

---

## Final summary format

End every `/test-fit` run with:
1. **Batch Summary:** `Batch | Verdict(s) | PR / Commit | Tests Added / Consolidated / Deleted | Wall-Clock Delta`
2. **Coverage Equivalence & Red-Without-Fix Receipts:** concrete proof for every hardened, added, consolidated, or deleted check.
3. **Receipt Table:** `Check | Result | Evidence`.
