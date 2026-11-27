---
name: pre-ship-review
description: "Independent four-lens read-only review of a committed branch (callers, sequences, blast radius, proof) plus one skeptic pass that merges duplicates and tries to refute findings, with JSONL finding fates and a three-round cap. Use for /pre-ship-review or before opening a PR that changes user-facing behavior, state writes, bookings, billing, or notifications."
---

# Pre-ship review

The session that wrote a change shares the blind spots that created its bugs. Run four independent read-only lenses on the committed `head`, then pass their raw findings to one skeptic, then verify and record every finding's fate.

Read [`../../docs/harness.md`](../../docs/harness.md) to map subagent calls to your active runtime.

## Inputs

Confirm these before spawning:
- `base`: target branch (default `origin/main` or the repo's integration branch)
- `head`: committed full 40-character SHA (commit everything first; never review a dirty working tree)
- `intent`: the claimed contract in plain words: what changes and what must stay unchanged
- `round`: **statefully derived** from existing `Finding fates` JSONL or prior review receipts on this branch/PR (`prior_rounds + 1`, hard cap at 3; never trust a caller-supplied default `1` to reset the counter, and refuse round 4 to revisit the design instead)
- For rounds 2-3: `since` (previous reviewed SHA) and `previous` (earlier findings + their fates)
- `author_provider`: authoring provider/model inferred from branch prefix, commit trailers, or PR metadata so the skeptic can be routed cross-provider whenever available

---

## Phase 1: Four parallel read-only lenses

Spawn four independent read-only subagents in one turn. Every lens inspects only committed git state (`git diff <base>...<head>`, `git show <head>:<path>`, `git grep -n <pattern> <head>`) and never edits files or touches production.

### Lens 1: Callers & regressions
For every changed function, find every caller at `head` and trace every branch condition (mode, channel, feature flag, config). Verify paths the contract promises to leave unchanged really are unchanged (payloads, messages, status codes, return shapes). Check types, nulls, and downstream assumptions.

### Lens 2: Sequences & concurrency
For every write, side effect, notification, or state transition added or altered, walk this matrix through the code at `head`:
- Same operation twice in one session; a third time
- `A` then `B`, and `B` then `A` for every pair of operations touched
- Repeat with identical data vs repeat adding new data
- Retry after a timeout; two requests at the same instant
- Failure midway (read fails, write fails, outbound notification throws)
- Deferred/async background jobs vs flags set synchronously

Report every cell that ends in a duplicate, silent drop, wrong message to a user, or inconsistent state.

### Lens 3: Blast radius, tenancy, privacy & silent product nerfing
Enumerate every setting or feature flag read by the changed code and walk its extremes (on, off, absent, contradictory combinations). Check recipients and opt-outs of notifications, webhooks, analytics, cost, shared surfaces (web, API, workers, MCP), privacy (no PII, secrets, tokens, or raw error dumps in logs), multi-tenant scoping on every read and write, and any newly added dependency (name, exact version, and whether it is genuinely needed). Run a **Notes-App & Silent Nerf check** on every new or changed regex guard, denylist, allowlist, prompt builder, model router, ML/inference path, or scoring weight:
- **Over-blocking & provenance blindness:** flag short unanchored substring collisions, bare category/payment nouns dropping informational answers, blanket link/phone stripping on authenticated owner inputs, owner operational notices downgraded to `"untrusted data"`, and any unrequested lifestyle, dietary, demographic, or ideological filtering.
- **Compute, cache & provider walls:** flag volatile timestamps (`HH:MM`), live status flags, or mutable notes placed before prompt-cache breakpoints, omitted `cache_control`, disabled streaming on fallback providers, `do_constant_folding=False`, hardcoded `fp32` / `mps` CPU fallbacks, hardcoded single-thread slowdowns (`intraOpNumThreads = 1`, `OMP_NUM_THREADS = 1`, `os.nice`), hidden env flags crippling live features, or asymmetric trace/context truncation across providers.

### Lens 4: Proof & anti-cheating test integrity
Read every added or modified test/check file at `head` before trusting green CI:
- **Anti-cheating audit:** list every changed test file and flag any assertion that was removed, loosened, skipped (`skip`/`only`), or replaced with a weaker check; quote exact old vs new lines.
- **Anti-gaming & anti-bloat:** flag literal no-op self-replacements in mutation proofs (`.replace(x, x)`), production logic copied into a test as its own oracle, vacuous assertions that pass if the fix is deleted, broken `indexOf` order checks where `-1` silently passes, standalone per-PR `readFileSync` source-grep scripts that import zero production code instead of behavioral tests inside consolidated domain suites, and unverified agent-invented one-way ratchet comments claiming human sign-off not present in the linked issue.
- **Hidden mocks:** flag any new mock or stub that hides a real API, DB, or boundary call the test previously exercised.
- **Scope creep:** flag any edit outside the approved plan or stated contract.
- **Contract coverage:** for each part of the contract, confirm a real assertion fails if that part of the fix is removed (vacuity control) and identify risky sequences from Lens 2 with zero coverage.

### Lens return rules
Each lens returns a list of findings (`severity: blocker|major|minor`, `title`, `evidence: file:line + code path + trigger input`, `suggested_fix`) plus a mandatory `paths_checked` list ("nothing found" without naming what was checked is invalid). **Suppress non-harm `minor` noise:** report a `minor` only when it carries concrete user, cost, or maintenance risk; never emit style comments or speculative nits. Also include the **top 3 specific `file:line` spots the human should read themselves**.

**Quota and rate-limit failover:** if any lens or skeptic model hits a quota or rate-limit error, abort retries immediately and fail over to an alternate configured provider or stand-in model (or stop and report cleanly). Never loop retrying a quota-exhausted provider.

In rounds 2-3: review `git diff <since>...<head>` only; never repeat settled findings (`intended`, `wrong`, `ignored` unless the new diff makes them worse); check that every `fixed` bug was fixed as a class across all instances.

---

## Phase 2: One skeptic pass (cross-provider preferred)

If raw findings > 0, launch one read-only **Skeptic** subagent with all numbered findings (`#0..#N-1`). Whenever the active runtime exposes multiple model providers, assign the Skeptic to a **different model provider/family** than `author_provider` to avoid same-provider echo chambers; on single-family runtimes, state in one line if the Skeptic shares the author's family. Apply these strict rules:

1. **Merge by user-visible wrong outcome**, not merely by shared function. Every raw finding number must appear in exactly one merged issue (unplaced findings are never dropped).
2. **Try to refute every `blocker` and `major`** by re-reading the actual code at `head`:
   - Confirm only if the path exists and produces the claimed outcome.
   - A contract accepting a harm does **not** refute the finding: confirm it and note that the contract accepted it so the human decides.
   - "Old behavior" requires proof at `base` (`git show <base>:<path>`). Code added by this diff or breaking a new contract promise is never "old behavior".
   - Set severity by impact, not gut probability. Ordinary user or model actions causing data loss, duplicates, silent product nerfing, or false user confirmation are at least `major`.
3. **Re-read `minor`-only findings that describe real loss or false user feedback.** Reviewers routinely under-rate silent drops as `minor`. Verify them under rule 2 and promote their severity if they hold. Drop speculative or zero-harm nits instead of carrying them forward.

---

## Phase 3: Owner verification & finding fates

The owner checks every item in `confirmed`, `minor`, and `refuted` (a skeptic refutation alone is not proof) and appends a `Finding fates` JSONL block beside the review output on the PR or issue:

```jsonl
{"head":"<40-char-SHA>","round":1,"finding":"confirmed:0","fate":"fixed","evidence":"<fix SHA; check name and red-without-fix result>"}
```

Keys: `confirmed:0`, `minor:0`, `refuted:0`. Fates: `fixed`, `wrong`, `intended`, `ignored` (with issue link for unfixed minors).

## Stateful hard 3-round cap

Never run round 4. Count rounds statefully from prior `Finding fates` JSONL / review comments on the PR or branch, never from a caller-supplied `round: 1` default. If findings still appear after 3 rounds, stop and simplify the design before restarting at round 1.

## Turn shipped incidents into eval cases

If a bug escapes review and ships (or causes a revert), save its `base`, `head`, `intent`, harm, and required finding in your repo's review calibration set so future review prompts can be tested against real past misses.
