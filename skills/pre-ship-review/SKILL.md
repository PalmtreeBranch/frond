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
- `round`: `1` (default), `2`, or `3` (hard cap at 3; refuse round 4 and revisit the design instead)
- For rounds 2-3: `since` (previous reviewed SHA) and `previous` (earlier findings + their fates)

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
Enumerate every setting or feature flag read by the changed code and walk its extremes (on, off, absent, contradictory combinations). Check recipients and opt-outs of notifications, webhooks, analytics, cost, shared surfaces (web, API, workers, MCP), privacy (no PII, secrets, tokens, or raw error dumps in logs), multi-tenant scoping on every read and write, and any newly added dependency (name, exact version, and whether it is genuinely needed). Run a **notes-app check** on every new or changed regex guard, denylist, allowlist, prompt rule, or scoring weight against realistic benign customer/owner inputs: flag short-substring collisions, bare category/payment nouns dropping informational answers, blanket link/phone stripping on authenticated owner inputs, and any unrequested preference or ideological filtering.

### Lens 4: Proof & anti-cheating test integrity
Read every added or modified test/check file at `head` before trusting green CI:
- **Anti-cheating audit:** list every changed test file and flag any assertion that was removed, loosened, skipped (`skip`/`only`), or replaced with a weaker check; quote exact old vs new lines.
- **No-op proofs & copied oracles:** flag no-op self-replacements in mutation proofs (`.replace(a, a)`), production logic copied into a test as its own oracle, and one-way ratchet comments claiming human sign-off not present in the linked issue.
- **Hidden mocks:** flag any new mock or stub that hides a real API, DB, or boundary call the test previously exercised.
- **Scope creep:** flag any edit outside the approved plan or stated contract.
- **Contract coverage:** for each part of the contract, confirm a real assertion fails if that part of the fix is removed (vacuity control) and identify risky sequences from Lens 2 with zero coverage.

### Lens return rules
Each lens returns a list of findings (`severity: blocker|major|minor`, `title`, `evidence: file:line + code path + trigger input`, `suggested_fix`) plus a mandatory `paths_checked` list ("nothing found" without naming what was checked is invalid). No style comments. Also include the **top 3 specific `file:line` spots the human should read themselves**.

In rounds 2-3: review `git diff <since>...<head>` only; never repeat settled findings (`intended`, `wrong`, `ignored` unless the new diff makes them worse); check that every `fixed` bug was fixed as a class across all instances.

---

## Phase 2: One skeptic pass

If raw findings > 0, launch one read-only **Skeptic** subagent with all numbered findings (`#0..#N-1`) and these strict rules:

1. **Merge by user-visible wrong outcome**, not merely by shared function. Every raw finding number must appear in exactly one merged issue (unplaced findings are never dropped).
2. **Try to refute every `blocker` and `major`** by re-reading the actual code at `head`:
   - Confirm only if the path exists and produces the claimed outcome.
   - A contract accepting a harm does **not** refute the finding: confirm it and note that the contract accepted it so the human decides.
   - "Old behavior" requires proof at `base` (`git show <base>:<path>`). Code added by this diff or breaking a new contract promise is never "old behavior".
   - Set severity by impact, not gut probability. Ordinary user or model actions causing data loss, duplicates, or false user confirmation are at least `major`.
3. **Re-read `minor`-only findings that describe real loss or false user feedback.** Reviewers routinely under-rate silent drops as `minor`. Verify them under rule 2 and promote their severity if they hold. Leave true nits as `minor` (`unverified`).

---

## Phase 3: Owner verification & finding fates

The owner checks every item in `confirmed`, `minor`, and `refuted` (a skeptic refutation alone is not proof) and appends a `Finding fates` JSONL block beside the review output on the PR or issue:

```jsonl
{"head":"<40-char-SHA>","round":1,"finding":"confirmed:0","fate":"fixed","evidence":"<fix SHA; check name and red-without-fix result>"}
```

Keys: `confirmed:0`, `minor:0`, `refuted:0`. Fates: `fixed`, `wrong`, `intended`, `ignored` (with issue link for unfixed minors).

## Hard 3-round cap

Never run round 4. If findings still appear after 3 rounds, stop and simplify the design before restarting at round 1.

## Turn shipped incidents into eval cases

If a bug escapes review and ships (or causes a revert), save its `base`, `head`, `intent`, harm, and required finding in your repo's review calibration set so future review prompts can be tested against real past misses.
