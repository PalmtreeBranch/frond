---
name: hill-climb
description: "Iterative improvement loop with a frozen baseline and clear definition of done: repeatedly tests one concrete hypothesis at a time (for a stubborn bug, low eval score, performance metric, or quality target), keeps only measured wins with green regression checks, reverts non-wins, pivots to a different approach at a plateau, and stops cleanly to ask for direction when incremental gains run out. Use for /hill-climb, improving an eval score, optimizing a metric, or iterating until done."
disable-model-invocation: true
---

# Hill climb

Iterate scientifically on one measurable target (a stubborn bug, a failing eval, a low quality score, latency, or bundle size) until the definition of done is met or incremental gains run out.

Core discipline: **one hypothesis, one measurement, keep or revert.** Never stack untested tweaks, and never claim an improvement without running the frozen check.

## Hard rules

1. **Define success before changing code.** Do not start looping without an explicit Definition of Done, a repeatable measurement command, and a regression gate.
2. **Freeze the measurement harness.** Never weaken, skip, or game the eval or test assertions to make the score go up.
3. **Keep only real wins.** Accept a change only when it moves the target past noise and keeps the regression gate green. Revert everything else in full. ("Might help" is never kept.)
4. **Stop at the plateau, do not spin.** When incremental tweaks stop working, try one genuinely different approach; if gains still stall, stop and present alternative directions to the user.

---

## Step 1: Establish success and baseline

Before iteration 1, write down and confirm (or infer from the user's request):
- **Target & Definition of Done:** exact metric or pass condition (for example: `eval >= 90%`, `0 failing cases`, `p95 < 200ms`, `bundle < 150 KB`).
- **Frozen check command:** one repeatable command that prints the score/metric (run multiple samples and take the median when noisy).
- **Regression gate:** fast tests/checks that must stay green on every kept iteration.
- **Guardrails:** max iterations (default `10`), plateau threshold (default `3` consecutive reverts), and any credit/cost cap (especially for LLM or voice evals!).

Run the frozen check command **before any edits** and record the baseline score.

---

## Step 2: Run the hill-climb loop

Keep a running attempt log (in your reply or a temporary untracked file outside git) with one row per iteration:

`| # | Hypothesis | Before | After | Delta | Gate | Verdict |`

For each iteration:
1. **Pick one specific mechanism.** State a concrete hypothesis grounded in what you observed in the previous run (not "try tweaking X randomly").
2. **Make the smallest change** that tests that single hypothesis.
   - When multiple independent hypotheses are worth testing at once, you may run 2-3 parallel subagents in separate worktrees against the same baseline and compare their measured deltas.
3. **Measure and gate:** run the frozen check command plus the regression gate.
4. **Decide:**
   - **Improved past noise + gate green:** keep it, make one clean commit staging only the changed files (never `git add -A`), and advance the baseline.
   - **Equal score + simpler code + gate green:** keep the simplification.
   - **No real improvement, worse score, or red gate:** revert the edit completely before starting the next hypothesis.
5. **Log the row** (kept or reverted) so later iterations never repeat a dead end.

---

## Step 3: Break through a plateau (or stop cleanly)

Stop the loop when **either**:
- The **Definition of Done** is reached (and verified on a clean run), or
- You hit a **plateau** (default: 3 consecutive non-improving iterations, or max iteration / cost budget reached).

When you hit a plateau before reaching the target:
1. **Do not keep micro-tweaking the same angle.**
2. **Step back and run one deliberate pivot check:**
   - Re-read the failing cases or bottleneck traces from scratch.
   - Ask whether a fundamentally different approach exists (different architecture, different prompt structure, different data structure, or spawning a fresh model/subagent for a blind second angle).
   - If one cheap, high-leverage pivot exists and budget remains, test it cleanly as the next iteration.
3. **Otherwise stop.** Do not relax the Definition of Done to declare victory. Hand the result back to the user with concrete options for the next direction.

---

## Step 4: Final receipt

End with:
- **Definition of Done & Metric:** target vs achieved (`baseline -> final`, exact delta).
- **Attempt log table:** every iteration (`kept` and `reverted`).
- **Kept commits:** 1-line summary per kept change.
- **Stop reason:** `Target reached`, `Plateau reached`, or `Budget reached`.
- **Alternative approaches to try next:** 2-3 concrete, non-incremental directions if the user wants to push further, plus one clear question on how to proceed.
