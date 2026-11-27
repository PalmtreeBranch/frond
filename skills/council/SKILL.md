---
name: council
description: "Multi-model blind parallel code review: three independent read-only reviewers from three different model families review a committed branch separately, the owner verifies every finding against the code and records finding fates, and the council re-reviews for at most three rounds until every seat approves. Use for /council, high-stakes changes (auth, tenancy, billing, migrations, critical flows), or multi-model review before opening a PR."
---

# Council review

Three read-only reviewers from three different model families review a committed branch independently. Agreement between models is not proof: the owner verifies every finding against the code at `head`, fixes what holds with a regression check, and runs at most three rounds.

Read [`../../docs/harness.md`](../../docs/harness.md) to map multi-provider delegation to your active runtime.

## 1. Before round 1

1. **Commit everything first.** Seats review the committed `head` SHA, never the dirty working tree. Record:
   - `base` (default `origin/main` or the repo's integration branch)
   - `head` (full 40-character SHA)
   - `intent` (what changes and what must stay unchanged, in plain words)
2. **Resolve the three seats:**
   - Check `~/.config/frond/models.md` or the repo's orchestration rules (`AGENTS.md` / T3 Code `orchestrator_capabilities`).
   - Pick **three distinct model families** plus **one stand-in** (never two seats from the same family in one round).
   - Never pick a route that bills outside the user's existing subscription unless the user explicitly approves it.
   - If the active runtime only exposes one model family, state that up front and ask the user whether to run a single-family blind panel or switch to a multi-provider runtime.
3. **Announce the seats in one line** before starting them (each seat spends quota).

### Stand-in & parity rules
- **Equal context and trace fidelity:** give every seat the exact same diff, file-access instructions, intent, and context/trace budget. Never strip, summarize away, or asymmetrically truncate traces or code context passed to rival providers.
- **No single-provider sole judge:** never pin one model provider as sole judge, tie-breaker, or unilateral skeptic over cheaper or rival models. Every seat has equal standing, and the owner verifies every finding directly against `head`.
- **Immediate quota failover:** if a seat's model is missing, disabled, rate-limited, or out of quota, abort retries immediately and fill it with the configured stand-in (never loop retrying an exhausted provider).
- If a seat crashes or stalls for a transient non-quota error, retry once. If the retry fails, fill it with the stand-in and state why.
- A council with fewer than three seated reviewers is not a council; ask the user whether to proceed or stop.
- Never silently treat a failed or timed-out seat as an approval.

---

## 2. Round 1: blind and parallel

Launch all three seats in the same turn as **read-only** reviewers. No seat sees another seat's output in round 1.

Each seat brief includes:
- Header: `Council review of <change/PR>, round 1 of at most 3, seat <family>. Read-only.`
- Exact git commands to inspect only the committed diff and files at `head`:
  - `git log --oneline <base>..<head>`
  - `git diff <base>...<head>`
  - `git show <head>:<path>` (never read the working tree)
- The `intent` (what must change and what must stay unchanged).
- Rules:
  - Report only real defects backed by `file:line` at `head`, exact code path, and concrete trigger input or sequence.
  - Explicitly check for **silent nerfing, guardrail overreach (Notes-App violations), compute/training/cache walls, alternative-provider handicapping, and verification gaming** in addition to security, data-integrity, and functional bugs.
  - Suppress non-harm `minor` noise: no style comments, no speculation without a code path.
  - Severity: `blocker` (data loss, security/tenancy leak, duplicate charge/write, broken critical user path, silent stripping of core owner/user data), `major` (wrong behavior a real user hits, prompt-cache busting, artificial compute/provider slowdown, vacuous/no-op proof), `minor` (concrete risk only).
  - Run an internal skeptic pass before replying.
  - End with one final line: `VERDICT: APPROVE` (when zero blocker/major findings survive) or `VERDICT: BLOCK`.
- Privacy rule: the brief points at code only; never include production data, customer PII, secrets, or local account IDs.

---

## 3. Merge, verify, and record fates

When all seats return:

1. **Merge findings into one numbered list** (`cross:0`, `cross:1`, ...). Two findings merge only when they describe the same wrong outcome on the same code path. Keep which seats raised each item and the highest severity given.
2. **Verify every finding against `head`.** A finding counts only with a verified code path and trigger input. Three seats agreeing on a hallucinated path is still `wrong`.
3. **Assign every item a fate with evidence** (JSONL format, one line per finding):

```jsonl
{"head":"<40-char-SHA>","round":1,"finding":"cross:0","fate":"fixed","evidence":"<fix SHA; check name and red-without-fix result>"}
```

Allowed fates:
- `fixed`: fix commit SHA + check/test that fails without the fix.
- `wrong`: exact code path/input at `head` disproving the claim.
- `intended`: accepted behavior, why it stands, and confirmation of no user harm.
- `ignored`: left unfixed (allowed for `minor` only), reason, and follow-up issue link if filed.

4. **Fix every confirmed `blocker` and `major`** in new commits on the branch, each with a check that goes red when the fix is reverted.

---

## 4. Rounds 2 and 3 (delta only)

Start fresh read-only subagents for each seat (never resume an old thread). Each round 2/3 brief adds:
- The delta range `<since>...<head>` (new commits only).
- The full merged list from prior rounds with every item's fate and evidence.
- This rule: *"For each settled item, reply `ACCEPT`, or `OBJECT` with a code path and input at `<head>` proving the fate is wrong. Report new findings only for `<since>...<head>`, or regressions it introduces. Name any recurring defect as a class with every remaining instance."*

Any `OBJECT` backed by real code evidence reopens that item for verification.

---

## 5. Exit rules and stateful 3-round cap

- **Approved:** in the same round, every seat returns `VERDICT: APPROVE`, zero `OBJECT` items remain open, and every `blocker`/`major` has fate `fixed`, `wrong`, or `intended` with verified evidence.
- **Stateful hard 3-round cap:** derive the round number from prior council `Finding fates` JSONL / review records on this branch or PR (never let a default `round: 1` reset the cap). There is no round 4. If the council has not converged after round 3, stop. Present a decision table to the user: each open item, which seats are on each side, the code evidence, and your recommendation. Do not open or merge the PR until the user decides.

---

## 6. Record the result

Include in the PR body or issue comment:
- `Reviewer: council (<family model>, ...)` (naming any stand-in and why it sat)
- Reviewed `head` SHA and round count
- Per-seat verdict for each round
- The full `Finding fates` JSONL block and the checks that prove each fix
