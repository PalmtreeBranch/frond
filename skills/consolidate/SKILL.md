---
name: consolidate
description: "Reduce architectural entropy through small-PR, low-revert closed-loop batches instead of giant unreviewable refactors: maps high-churn duplicates, shallow wrappers, and coupling hotspots ('Day 1 with full hindsight'), applies Ousterhout's Deletion Test and a Semantic Equivalence Gate, locks a behavioral baseline, migrates every caller, deletes the replaced implementation in the same small PR, and pins boundaries via correction-loop. Use for /consolidate, reducing codebase entropy, deduplicating parallel helpers, or incremental architecture cleanup."
---

# Consolidate (architectural entropy reduction)

Systematically reduce architectural entropy so a codebase stays easy for humans to read and safe for parallel agents to change, **without ever creating giant, unreviewable mega-branches**.

**Core mental model ("Day 1 with full hindsight"):**
Assume today is day one of the product, except you already know every real user workflow, edge case, and production constraint. Picture the clean canonical shape the codebase *should* have, then converge toward it one **small, closed-loop, independently mergeable PR** at a time.

Read [`../../docs/harness.md`](../../docs/harness.md) for runtime primitives and [`../frond-mode/worker.md`](../frond-mode/worker.md) for PR size and verification rules.

---

## Hard rules

1. **Never build giant mega-branches.** Never refactor 12 domains in one giant worktree. One canonical concept or boundary cleanup = one isolated branch/worktree = **one small, independently mergeable PR** (aim for <300-400 net lines changed unless pure mechanical import rewrites).
2. **Hotspots only; zero cold-code churn.** Prioritize modules with real `git log` churn, repeated bugs, or multi-file edit pain. Leave stable, rarely-touched code alone even if its style looks dated.
3. **Every batch must close the loop.** Never add a new canonical helper, directory, or interface and stop halfway. Within the same batch, migrate callers and **delete the replaced implementation** (retain a compatibility shim *only* when external callers, public APIs, or persisted data contracts require it, with explicit sunset criteria).
4. **Semantic Equivalence before merging.** Two functions that look 90% alike often differ on a real edge case (timezone, tenant boundary, auth provenance, retry/idempotency, locale). Prove semantic equivalence first; never merge distinct domain concepts just to save lines.
5. **Behavioral baseline before editing.** Lock real caller behavior with tests before deleting or rewiring anything.
6. **Enforce without check sprawl.** Lock completed boundaries via [`../correction-loop/SKILL.md`](../correction-loop/SKILL.md) (types, compiler rules, `no-restricted-imports` / cycle lint, or consolidated domain tests). Never add standalone per-PR `readFileSync` source-grep scripts.

---

## The 7 engineering properties to converge toward

1. **Single Source of Truth:** every business rule, schema/type, config key, state owner, and UI token has one authoritative home.
2. **Canonical Implementation:** one standard implementation per responsibility; eliminate parallel v1/v2 helpers, copy-pasted patches, and dead compatibility wrappers.
3. **Deep Modules (Ousterhout's Deletion Test):** hide real complexity behind a small, stable interface. Apply the **Deletion Test** to every wrapper or layer: *if this layer is deleted, does complexity disappear, or does it leak into callers?* Delete shallow pass-through layers where deleting the layer removes complexity.
4. **High Cohesion, Low Coupling:** clear ownership and one-way dependency direction; zero unapproved circular dependencies, cross-layer reach-throughs, or shared mutable state.
5. **Locality of Change:** changing one business rule touches one logical module instead of requiring synchronized edits across a dozen unrelated files.
6. **Deletion over Accumulation:** prefer deleting dead flags, unused abstractions, and superseded helpers over adding configuration or adapters.
7. **Enforceable Architecture:** turn settled module boundaries into compiler, type, lint, or behavioral test constraints so the next agent run cannot reintroduce the deleted pattern.

---

## Inputs & modes

- **Mode:**
  - `--plan` (read-only): build the Entropy Map and ranked batch queue without editing files.
  - Default (execute): run Phase 1 (read-only map), confirm or select top batches, and execute up to the batch budget.
- **Scope:** repo-wide hotspots (default) or a focused path/domain (for example `--scope lib/billing` or `--scope notifications`).
- **Batch budget:** default `3` small closed-loop PRs per run (`--batches N` to adjust). Never run unbounded across the whole repository without an explicit batch cap.

---

## Phase 1: Read-only Entropy Map & hotspot ranking

Before touching a single file:

1. **Measure real hotspots (`git log` + fan-in):**
   - Inspect recent commit frequency and bug-fix churn (`git log --since="60 days ago" --name-only --pretty=format:`) to find where engineers and agents actually pay complexity tax today.
   - Trace co-change clusters (files that repeatedly have to be edited together for one small feature or rule change).
2. **Scan active surfaces for architectural entropy** (focusing on high-churn areas across domain logic, API/data contracts, state/caching, auth/permissions, error/retry handling, config/env, shared utilities, and UI primitives):
   - Parallel or duplicate implementations of the same semantics
   - Half-finished migrations where old and new systems coexist
   - Shallow forwarding layers failing the **Deletion Test**
   - Circular dependencies or upward cross-layer imports
   - Scattered config, env, or business constants violating Single Source of Truth
3. **Rank candidate batches** by:
   `Priority = (Entropy Removed x Churn Frequency x Locality Gain) / Blast Radius`
   - Put small, high-churn, low-blast-radius consolidations at the top.
   - Move any item requiring a product call, schema/API breaking change, or multi-day redesign into a **Pending Decisions** table (never guess or force it into an automated batch).
4. **Output the Entropy Map** (concise table: `Batch ID | Entropy Pattern | Canonical Target | Callers to Migrate | Files Deleted | Risk | Est. Diff Size`). If invoked with `--plan`, stop here.

---

## Phase 2: Closed-loop batch loop (1 concept = 1 branch = 1 small PR)

Execute up to `--batches N` independent batches. Always start each batch on a fresh branch/worktree from the latest integration branch (`origin/main`):

### Step 1: Semantic Equivalence & Blast-Radius check
- Read every implementation and caller in full (use [`../blast-radius/SKILL.md`](../blast-radius/SKILL.md) for non-grep links: DB columns, JSON payloads, webhooks, queues, feature flags).
- List every behavioral difference between the duplicate paths.
  - If a difference is a real caller requirement, support it cleanly in the canonical interface or keep the concepts separate (abort the merge and record why).
  - Apply the **Deletion Test** to confirm the target interface is genuinely deeper and simpler than what it replaces.

### Step 2: Lock the behavioral baseline
- Run existing domain tests for all affected callers.
- Add missing behavioral characterization assertions for real edge cases before refactoring so any subtle regression turns red immediately.

### Step 3: Migrate all callers & delete the replaced code
- Build or refine the single canonical implementation.
- Migrate **every** internal caller in this batch.
- **Delete the replaced implementation, dead helpers, and obsolete shims** in the same branch. Confirm zero stray imports or dead references remain.
- If the diff starts exceeding a clean, reviewable PR (for example >15-20 caller files with non-trivial logic changes), split by caller slice while adding a temporary lint deprecation rule (`no-restricted-imports`) that blocks new callers, and schedule the deletion PR immediately next in the queue.

### Step 4: Independent review & anti-regression lock
- Run fast affected tests, typecheck, and lint.
- Run [`../pre-ship-review/SKILL.md`](../pre-ship-review/SKILL.md) when user-facing behavior, state writes, bookings, billing, or notifications are touched.
- If the batch touches outbound guards, denylists, prompt builders/`cache_control`, model routers, or ML/inference paths, run cross-provider [`../nerf-audit/SKILL.md`](../nerf-audit/SKILL.md) to confirm consolidation did not widen a blocklist or bust a cache.
- Add a structural anti-regression rule via [`../correction-loop/SKILL.md`](../correction-loop/SKILL.md) (type narrowing, `no-restricted-imports`, cycle check, or domain test) with a real red-without-fix check.

### Step 5: Ship small & record
- Commit explicit touched paths only and open one small ready PR (`draft: false`, body <40 lines, ending with a Receipt Table).
- Hand off to [`../land-pr/SKILL.md`](../land-pr/SKILL.md) when merging to `main` (or queue the PR cleanly via [`../work-queue/SKILL.md`](../work-queue/SKILL.md)).
- Append one row to the repo's consolidation log (`docs/architecture/consolidation-log.md` if used, or the tracking issue) recording what became canonical, what was deleted, the anti-regression rule, and any parked **Pending Decisions**.
- Stop immediately if the batch budget is reached, 2 CI/test rounds fail on the same batch, or only `Pending Decisions` items remain.

---

## Final summary format

End every `/consolidate` run with:
1. **Completed Closed-Loop Batches:** `Batch | PR / Commit | Canonical Module | Deleted Legacy Paths | Enforcement Added`
2. **Pending Decisions (human input needed):** items skipped due to product ambiguity or breaking contracts, with options and tradeoffs.
3. **Receipt Table:** `Check | Result | Evidence`.
